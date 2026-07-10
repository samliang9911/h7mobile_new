import {http_request} from '@/api/api.js';
import {ToTreeData} from '@/utils/dataPool.js'
/**
 * 获取选人页面数据
*/
export function get(type,{IsAll,OrgOID,Status}){
	const push = (arr,set) => arr.forEach(str => !set.includes(str) && set.push(str));
	const lev = {
		org:['1'],
		dept:['1','2'],
		orgdept:['1','2'],
		post:['1', '2', '4'],
		person:['1', '2', '3'],
	}
	const func = {
		person(obj,tag='person'){
			if(!obj.person){
				obj.person = {
					tag: 'sel',
					tb: 'View_Sys_ORGPostPerson',
					alias:'person',
					wh: {
						Filter: ' Lev IN {lev} ',
						Param: {
							lev:['1']
						},
					},
					field: 'OID,ParentOID,Code,Name,Name_All,DeptName,OrgName,PostName,Status,MobilePhone,Lev,HaveLev,HaveLev_Post,HaveLev_Org,HaveLev_Dept,UserOID,OrgOID,DeptOID,PostOID',
					n_ob: 'Code',
					tol: 1000,
				}
        if(['0','1'].includes(Status)){
          obj.person.wh.Filter+=' and ( Status = {Status} or Status IsNullOrEmpty ) '
          obj.person.wh.Param.Status = Status=='1';
        }
        if(OrgOID){
          obj.person.wh.Filter+=' and ( OrgOID = {OrgOID} or DeptOID = {OrgOID} ) '
          obj.person.wh.Param.OrgOID = OrgOID;
        }
			}
			push(lev[tag],obj.person.wh.Param.lev);
		},
		org(e){this.person(e,'org')},
		dept(e){this.person(e,'dept')},
		orgdept(e){this.person(e,'orgdept')},
		post(e){this.person(e,'post')},
		group(obj){
			obj.group = {
				tag: 'sel',
				tb: 'Sys_GROUPMaster',
				alias: 'group',
				field: 'Sys_GROUPMasterOID,GroupID,PerformerName,GroupName,PersonName',
				tol: 1000,
			}
		}
	}
	let sql = type.reduce((a,b)=>func[b]?(func[b](a,b),a):a,{})
	let request = Object.keys(sql).map(e=>http_request('',{json:[sql[e]]}))
  let UOIDType = {person:'U',org:'O',dept:'D',orgdept:'O',post:'P'}
	return Promise.all(request).then(res=>{
		return res.reduce((a,{person,group})=>{
			if(person){
				type.filter(e=>e!='group').forEach(e=>{
          let data = person.Items.filter(o=>lev[e].includes(String(o.Lev))).map(o=>{
            return {
              ...o,
              type:e,
              UOID:`(${UOIDType[e]}:${o.OID})`,
            }
          })
          if(IsAll&&IsAll.toLowerCase()=='yes'){
            data.push({
              OID:'(J:所有人)',
              UOID:'(J:所有人)',
              Name:'所有人',
              ParentOID:'00000000-0000-0000-0000-000000000000'
            })
          }
					a[e] = ToTreeData(
            data,
            {"Line": "OID","Father": "ParentOID"},
            item=>!item.UserOID && !item.children ? false : void 0
          )
				})
			}
			else if(group){
				group.Items.forEach(e=>{
					e.Name=e.GroupName
					e.OID = e.Sys_GROUPMasterOID
          e.UOID = `(G:${e.Sys_GROUPMasterOID})`
          e.type = 'group'
				})
        if(IsAll&&IsAll.toLowerCase()=='yes'){
          group.Items.push({
            OID:'(J:所有人)',
            UOID:'(J:所有人)',
            Name:'所有人',
            ParentOID:'00000000-0000-0000-0000-000000000000'
          })
        }
				a.group = group.Items
			}
			return a
		},{})
	})
}