const crypto=require('node:crypto');
const BASE='appzY7kD0Si8Vz999', TABLE='tblAutCSnJImXuMiV';
const F={title:'fldYhvrpvXkwiz88M',category:'fld3uy8OuWqevq53w',start:'fldMxNx84WNk86lX1',end:'flddX0qu0DZNs74BC',deadline:'fld3lmRVzE1xmMvXE',owners:'fldKgQdgxvpoXiqCF',deliverable:'fldvClRlteLcE9lHa',status:'fld2PPFxqu5oei26G',notes:'fldYXmUXblpQvzFZx',type:'fldtHgDkrPB18q1uJ'};
const types={Video:'🎬 Video Coverage',Broadcast:'🎙️ Live Broadcast',Campaign:'🚀 Launch & Campaign',Creative:'🎨 Creative & Brand',Operations:'📋 Operations & Planning'};
const reverse=Object.fromEntries(Object.entries(types).map(([k,v])=>[v,k]));
const keyPrefix=Object.fromEntries(Object.entries(F).map(([k,v])=>[v,k]));
const env=process.env;
const json=(status,data)=>({statusCode:status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},body:JSON.stringify(data)});
function authorized(event){const expected=Buffer.from(env.RBC_TEAM_PASSWORD||'');const supplied=Buffer.from(event.headers['x-rbc-access']||'');return expected.length>=12 && supplied.length===expected.length && crypto.timingSafeEqual(expected,supplied)}
async function airtable(path,method='GET',payload){const r=await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}${path}`,{method,headers:{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,'Content-Type':'application/json'},body:payload?JSON.stringify(payload):undefined});let result=await r.json();if(!r.ok)throw Error(result?.error?.message||`Airtable error ${r.status}`);return result}
const value=(x)=>x&&typeof x==='object'&&x.name?x.name:x;
const toRecord=(r)=>{const c=r.fields||{};const out={id:r.id};for(const [k,f] of Object.entries(F)){let v=value(c[f]);out[k]=k==='type'?(reverse[v]||'Operations'):(v||'')}return out};
function fields(body){const result={};for(const [key,f] of Object.entries(F)){if(!(key in body))continue;let v=body[key];if(typeof v!=='string')continue;v=v.trim();if(key==='type'){if(types[v])result[f]=types[v];continue}if(['start','end','deadline'].includes(key)){if(v&&!/^\d{4}-\d{2}-\d{2}$/.test(v))throw Error('Invalid date');result[f]=v||null;continue}if(key==='category'&&!['RBC Internal','Events Coverage'].includes(v))throw Error('Invalid category');if(key==='status'&&!['Not started','Planned','In progress','Ongoing','Needs confirmation','Pending date','Completed'].includes(v))throw Error('Invalid status');result[f]=v.slice(0,key==='notes'?9000:500)}if(!('fldYhvrpvXkwiz88M' in result)&&!body.id)throw Error('Title required');return result}
exports.handler=async(event)=>{
  if(!env.AIRTABLE_TOKEN||!env.RBC_TEAM_PASSWORD)return json(503,{error:'Server configuration incomplete. Add AIRTABLE_TOKEN and RBC_TEAM_PASSWORD to Netlify environment variables.'});
  if(!authorized(event))return json(401,{error:'Incorrect team password'});
  try{
    if(event.httpMethod==='GET'){let all=[],offset;do{const qs=new URLSearchParams({pageSize:'100',returnFieldsByFieldId:'true'});if(offset)qs.set('offset',offset);const p=await airtable('?'+qs);all.push(...p.records.map(toRecord));offset=p.offset;}while(offset);return json(200,{records:all})}
    const data=JSON.parse(event.body||'{}');
    if(event.httpMethod==='POST'){if(!data.title||!data.title.trim())return json(400,{error:'Title is required'});return json(201,{record:toRecord(await airtable('','POST',{fields:fields(data),returnFieldsByFieldId:true,typecast:false}))})}
    if(!/^rec[A-Za-z0-9]{14}$/.test(data.id||''))return json(400,{error:'Invalid record ID'});
    if(event.httpMethod==='PATCH')return json(200,{record:toRecord(await airtable('/'+data.id,'PATCH',{fields:fields(data),returnFieldsByFieldId:true,typecast:false}))});
    if(event.httpMethod==='DELETE')return json(200,await airtable('/'+data.id,'DELETE'));
    return json(405,{error:'Method not allowed'});
  }catch(err){return json(500,{error:err.message||'Unexpected error'})}
};
