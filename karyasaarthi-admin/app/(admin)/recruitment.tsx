/**
 * Recruitment — HR panel: Job Postings + Applications Pipeline + Interviews
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentService, type JobPosting, type Application, type Interview } from '@/services/recruitment';
import { useAppTheme } from '@/utils/theme';
import Toast from 'react-native-toast-message';

const APP_STATUSES = ['new','shortlisted','interview_scheduled','selected','offer_sent','joined','rejected'] as const;
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new:                  { bg: '#EFF6FF', text: '#2563EB' },
  shortlisted:          { bg: '#FEF3C7', text: '#D97706' },
  interview_scheduled:  { bg: '#EDE9FE', text: '#7C3AED' },
  selected:             { bg: '#D1FAE5', text: '#059669' },
  offer_sent:           { bg: '#DBEAFE', text: '#1D4ED8' },
  joined:               { bg: '#D1FAE5', text: '#065F46' },
  rejected:             { bg: '#FEE2E2', text: '#DC2626' },
  active:               { bg: '#D1FAE5', text: '#059669' },
  draft:                { bg: '#F3F4F6', text: '#6B7280' },
  closed:               { bg: '#FEE2E2', text: '#DC2626' },
  scheduled:            { bg: '#EDE9FE', text: '#7C3AED' },
  completed:            { bg: '#D1FAE5', text: '#059669' },
  cancelled:            { bg: '#FEE2E2', text: '#DC2626' },
};

function Badge({ s }: { s: string }) {
  const c = STATUS_COLORS[s] ?? { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: c.text }}>{s.replace(/_/g,' ').toUpperCase()}</Text>
    </View>
  );
}

export default function RecruitmentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const T = useAppTheme();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'jobs'|'applications'|'interviews'>('jobs');
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [expandedApp, setExpandedApp] = useState<number|null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [jobForm, setJobForm] = useState({
    title:'', category:'employee', department:'', location:'', work_type:'remote',
    job_type:'full_time', salary_range:'', positions:'1', description:'', requirements:'', skills:'', status:'draft',
  });

  const { data: jobsData, refetch: rJobs, isRefetching: rjRef } = useQuery({ queryKey:['recruit-jobs'], queryFn: recruitmentService.getJobs });
  const { data: appsData, refetch: rApps, isRefetching: raRef } = useQuery({ queryKey:['recruit-apps', filterStatus], queryFn: () => recruitmentService.getApplications(undefined, filterStatus||undefined) });
  const { data: intData,  refetch: rInt,  isRefetching: riRef } = useQuery({ queryKey:['recruit-interviews'], queryFn: recruitmentService.getInterviews });

  const jobs:       JobPosting[] = jobsData?.jobs ?? [];
  const apps:       Application[] = appsData?.applications ?? [];
  const interviews: Interview[]   = intData?.interviews ?? [];

  const createJobMut = useMutation({
    mutationFn: (d: Record<string,string|number>) => recruitmentService.createJob(d),
    onSuccess: (r:any) => { if(r.success){ Toast.show({type:'success',text1:'Job Created!'}); setShowCreateJob(false); qc.invalidateQueries({queryKey:['recruit-jobs']}); } else Alert.alert('Error', r.message); },
  });

  const jobStatusMut = useMutation({
    mutationFn: ({id,s}:{id:number;s:string}) => recruitmentService.updateJobStatus(id,s),
    onSuccess: () => { Toast.show({type:'success',text1:'Updated'}); qc.invalidateQueries({queryKey:['recruit-jobs']}); },
  });

  const deleteJobMut = useMutation({
    mutationFn: (id:number) => recruitmentService.deleteJob(id),
    onSuccess: () => { Toast.show({type:'success',text1:'Deleted'}); qc.invalidateQueries({queryKey:['recruit-jobs']}); },
  });

  const appStatusMut = useMutation({
    mutationFn: ({id,s}:{id:number;s:string}) => recruitmentService.updateApplicationStatus(id,s),
    onSuccess: (r:any) => { Toast.show({type:'success',text1: r.message||'Updated'}); qc.invalidateQueries({queryKey:['recruit-apps']}); },
  });

  const delIntMut = useMutation({
    mutationFn: (id:number) => recruitmentService.deleteInterview(id),
    onSuccess: () => { Toast.show({type:'success',text1:'Deleted'}); qc.invalidateQueries({queryKey:['recruit-interviews']}); },
  });

  const s = StyleSheet.create({
    c:    { flex:1, backgroundColor: T.background },
    hdr:  { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:12, gap:12 },
    back: { width:36, height:36, borderRadius:10, backgroundColor:T.surfaceContainer, alignItems:'center', justifyContent:'center' },
    tabs: { flexDirection:'row', marginHorizontal:16, marginBottom:12, backgroundColor:T.surfaceContainer, borderRadius:12, padding:4 },
    tab:  { flex:1, paddingVertical:8, borderRadius:10, alignItems:'center' },
    card: { backgroundColor:T.surface, borderRadius:14, borderWidth:1, borderColor:T.hairline, marginHorizontal:16, marginBottom:12, padding:14 },
    addBtn:{ backgroundColor:T.brandGreen, width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center' },
    inpLbl:{ fontSize:12, fontWeight:'600', color:T.muted, marginBottom:4, marginTop:10 },
    inp:  { backgroundColor:T.surfaceContainer, borderRadius:10, paddingHorizontal:12, paddingVertical:10, color:T.ink, fontSize:13, borderWidth:1, borderColor:T.hairline },
    rowBtn:{ flexDirection:'row', gap:8, marginTop:8 },
    sBtn: { paddingHorizontal:10, paddingVertical:5, borderRadius:8, borderWidth:1 },
  });

  const refetchAll = () => { rJobs(); rApps(); rInt(); };
  const isRefetching = rjRef || raRef || riRef;

  return (
    <View style={[s.c, { paddingTop:insets.top }]}>
      {/* Header */}
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="arrow-back" size={20} color={T.ink} /></TouchableOpacity>
        <View style={{flex:1}}>
          <Text style={{fontSize:20,fontWeight:'700',color:T.ink}}>Recruitment</Text>
          <Text style={{fontSize:11,color:T.muted}}>HR Management Panel</Text>
        </View>
        {tab==='jobs' && <TouchableOpacity style={s.addBtn} onPress={()=>setShowCreateJob(true)}><Ionicons name="add" size={20} color="#FFF"/></TouchableOpacity>}
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['jobs','applications','interviews'] as const).map(t=>(
          <TouchableOpacity key={t} style={[s.tab, tab===t&&{backgroundColor:T.brandGreen}]} onPress={()=>setTab(t)}>
            <Text style={{fontSize:12,fontWeight:'700',color:tab===t?'#FFF':T.muted,textTransform:'capitalize'}}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll}/>} showsVerticalScrollIndicator={false}>

        {/* ── JOBS TAB ─────────────────────────────── */}
        {tab==='jobs' && (
          jobs.length===0
          ? <View style={{alignItems:'center',padding:48}}><Ionicons name="briefcase-outline" size={48} color={T.muted}/><Text style={{color:T.muted,marginTop:8}}>No job postings yet</Text></View>
          : jobs.map(job=>(
            <View key={job.job_id} style={s.card}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
                <View style={{flex:1,marginRight:8}}>
                  <Text style={{fontSize:15,fontWeight:'700',color:T.ink}}>{job.title}</Text>
                  <Text style={{fontSize:12,color:T.muted,marginTop:2}}>{job.category} · {job.department||'N/A'} · {job.positions} positions</Text>
                </View>
                <Badge s={job.status}/>
              </View>
              {job.salary_range ? <Text style={{fontSize:12,color:T.muted,marginTop:4}}>💰 {job.salary_range}</Text> : null}
              {job.deadline ? <Text style={{fontSize:12,color:'#EF4444',marginTop:2}}>⏳ Deadline: {new Date(job.deadline).toLocaleDateString('en-IN')}</Text> : null}
              <View style={s.rowBtn}>
                {job.status!=='active'&&<TouchableOpacity onPress={()=>jobStatusMut.mutate({id:job.job_id,s:'active'})} style={[s.sBtn,{borderColor:'#10B981'}]}><Text style={{fontSize:11,color:'#10B981',fontWeight:'600'}}>✓ Activate</Text></TouchableOpacity>}
                {job.status==='active'&&<TouchableOpacity onPress={()=>jobStatusMut.mutate({id:job.job_id,s:'closed'})} style={[s.sBtn,{borderColor:'#F59E0B'}]}><Text style={{fontSize:11,color:'#F59E0B',fontWeight:'600'}}>⊘ Close</Text></TouchableOpacity>}
                <TouchableOpacity onPress={()=>Alert.alert('Delete Job','This will delete the job posting and all its data.',[ {text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteJobMut.mutate(job.job_id)} ])} style={[s.sBtn,{borderColor:'#EF4444'}]}>
                  <Text style={{fontSize:11,color:'#EF4444',fontWeight:'600'}}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* ── APPLICATIONS TAB ─────────────────────── */}
        {tab==='applications' && (<>
          {/* Status filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginHorizontal:16,marginBottom:8}}>
            <View style={{flexDirection:'row',gap:8,paddingVertical:4}}>
              {['', ...APP_STATUSES].map(st=>(
                <TouchableOpacity key={st||'all'} onPress={()=>setFilterStatus(st)}
                  style={{paddingHorizontal:12,paddingVertical:6,borderRadius:99,backgroundColor:filterStatus===st?T.brandGreen:T.surfaceContainer,borderWidth:1,borderColor:filterStatus===st?T.brandGreen:T.hairline}}>
                  <Text style={{fontSize:11,fontWeight:'700',color:filterStatus===st?'#FFF':T.muted}}>{st?st.replace(/_/g,' '):'All'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {apps.length===0
            ? <View style={{alignItems:'center',padding:48}}><Ionicons name="document-outline" size={48} color={T.muted}/><Text style={{color:T.muted,marginTop:8}}>No applications found</Text></View>
            : apps.map(app=>(
              <View key={app.application_id} style={s.card}>
                <TouchableOpacity onPress={()=>setExpandedApp(expandedApp===app.application_id?null:app.application_id)}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View style={{flex:1}}>
                      <Text style={{fontSize:14,fontWeight:'700',color:T.ink}}>{app.applicant_name}</Text>
                      <Text style={{fontSize:11,color:T.muted,marginTop:2}}>{app.job_title} · {app.email}</Text>
                      {app.phone?<Text style={{fontSize:11,color:T.muted}}>📞 {app.phone}</Text>:null}
                    </View>
                    <View style={{alignItems:'flex-end',gap:6}}>
                      <Badge s={app.status}/>
                      <Ionicons name={expandedApp===app.application_id?'chevron-up':'chevron-down'} size={14} color={T.muted}/>
                    </View>
                  </View>
                </TouchableOpacity>
                {expandedApp===app.application_id && (
                  <View style={{marginTop:12,borderTopWidth:1,borderTopColor:T.hairline,paddingTop:12}}>
                    <Text style={{fontSize:12,fontWeight:'600',color:T.muted,marginBottom:8}}>Move to Status:</Text>
                    <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>
                      {APP_STATUSES.filter(st=>st!==app.status).map(st=>{
                        const c=STATUS_COLORS[st]??{bg:T.hairline,text:T.muted};
                        return (
                          <TouchableOpacity key={st} onPress={()=>appStatusMut.mutate({id:app.application_id,s:st})}
                            style={{backgroundColor:c.bg,paddingHorizontal:10,paddingVertical:6,borderRadius:8}}>
                            <Text style={{fontSize:11,fontWeight:'700',color:c.text}}>{st.replace(/_/g,' ')}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {app.total_score>0 && (
                      <View style={{marginTop:10,backgroundColor:T.surfaceContainer,borderRadius:8,padding:10}}>
                        <Text style={{fontSize:12,fontWeight:'600',color:T.ink}}>Interview Score: {app.total_score}/50</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))
          }
        </>)}

        {/* ── INTERVIEWS TAB ───────────────────────── */}
        {tab==='interviews' && (
          interviews.length===0
          ? <View style={{alignItems:'center',padding:48}}><Ionicons name="videocam-outline" size={48} color={T.muted}/><Text style={{color:T.muted,marginTop:8}}>No interviews scheduled</Text></View>
          : interviews.map(iv=>(
            <View key={iv.interview_id} style={s.card}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
                <View style={{flex:1}}>
                  <Text style={{fontSize:14,fontWeight:'700',color:T.ink}}>{iv.applicant_name}</Text>
                  <Text style={{fontSize:11,color:T.muted}}>{iv.job_title}</Text>
                  <Text style={{fontSize:12,color:T.ink,marginTop:4}}>📅 {new Date(iv.interview_date).toLocaleString('en-IN')}</Text>
                  <Text style={{fontSize:11,color:T.muted}}>Type: {iv.interview_type?.replace(/_/g,' ')}</Text>
                  {iv.meeting_link?<Text style={{fontSize:11,color:'#6366F1',marginTop:2}}>🔗 {iv.meeting_link}</Text>:null}
                </View>
                <Badge s={iv.status}/>
              </View>
              <View style={s.rowBtn}>
                <TouchableOpacity onPress={()=>Alert.alert('Delete','Delete this interview record?',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>delIntMut.mutate(iv.interview_id)}])}
                  style={[s.sBtn,{borderColor:'#EF4444'}]}>
                  <Text style={{fontSize:11,color:'#EF4444',fontWeight:'600'}}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{height:40}}/>
      </ScrollView>

      {/* Create Job Modal */}
      <Modal visible={showCreateJob} transparent animationType="slide" onRequestClose={()=>setShowCreateJob(false)}>
        <View style={{flex:1,justifyContent:'flex-end',backgroundColor:'#00000066'}}>
          <View style={{backgroundColor:T.surface,borderTopLeftRadius:24,borderTopRightRadius:24,padding:24,paddingBottom:insets.bottom+24,maxHeight:'90%'}}>
            <View style={{width:36,height:4,backgroundColor:T.hairline,borderRadius:2,alignSelf:'center',marginBottom:16}}/>
            <Text style={{fontSize:18,fontWeight:'700',color:T.ink,marginBottom:4}}>Create Job Posting</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {([
                {key:'title',label:'Job Title *',placeholder:'e.g. Content Writer'},
                {key:'department',label:'Department',placeholder:'e.g. Marketing, Tech, HR'},
                {key:'location',label:'Location',placeholder:'e.g. Delhi, Remote'},
                {key:'salary_range',label:'Salary Range',placeholder:'e.g. ₹15,000–₹25,000/mo'},
                {key:'positions',label:'Open Positions',placeholder:'1'},
              ] as const).map(({key,label,placeholder})=>(
                <View key={key}>
                  <Text style={s.inpLbl}>{label}</Text>
                  <TextInput value={jobForm[key]} onChangeText={v=>setJobForm(p=>({...p,[key]:v}))}
                    placeholder={placeholder} placeholderTextColor={T.muted} style={s.inp}/>
                </View>
              ))}

              <Text style={s.inpLbl}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{flexDirection:'row',gap:8,paddingVertical:4}}>
                  {['employee','intern','vendor','campus_saarthi','teaching_expert','pillar_post'].map(c=>(
                    <TouchableOpacity key={c} onPress={()=>setJobForm(p=>({...p,category:c}))}
                      style={{paddingHorizontal:10,paddingVertical:6,borderRadius:99,backgroundColor:jobForm.category===c?T.brandGreen:T.surfaceContainer,borderWidth:1,borderColor:jobForm.category===c?T.brandGreen:T.hairline}}>
                      <Text style={{fontSize:11,fontWeight:'700',color:jobForm.category===c?'#FFF':T.muted}}>{c.replace(/_/g,' ')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={s.inpLbl}>Status</Text>
              <View style={{flexDirection:'row',gap:8}}>
                {['draft','active'].map(st=>(
                  <TouchableOpacity key={st} onPress={()=>setJobForm(p=>({...p,status:st}))}
                    style={{flex:1,padding:10,borderRadius:10,alignItems:'center',borderWidth:2,borderColor:jobForm.status===st?T.brandGreen:T.hairline}}>
                    <Text style={{fontSize:12,fontWeight:'700',color:jobForm.status===st?T.brandGreen:T.muted,textTransform:'capitalize'}}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.inpLbl}>Description</Text>
              <TextInput value={jobForm.description} onChangeText={v=>setJobForm(p=>({...p,description:v}))}
                placeholder="Job description..." placeholderTextColor={T.muted} multiline numberOfLines={3}
                style={[s.inp,{height:80,textAlignVertical:'top'}]}/>

              <Text style={s.inpLbl}>Requirements</Text>
              <TextInput value={jobForm.requirements} onChangeText={v=>setJobForm(p=>({...p,requirements:v}))}
                placeholder="Requirements & qualifications..." placeholderTextColor={T.muted} multiline numberOfLines={3}
                style={[s.inp,{height:80,textAlignVertical:'top',marginBottom:16}]}/>

              <View style={{flexDirection:'row',gap:10}}>
                <TouchableOpacity onPress={()=>setShowCreateJob(false)} style={{flex:1,padding:16,borderRadius:14,borderWidth:1,borderColor:T.hairline,alignItems:'center'}}>
                  <Text style={{color:T.muted,fontWeight:'600'}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{ if(!jobForm.title.trim()){Alert.alert('Required','Job title is required');return;} createJobMut.mutate(jobForm as any); }}
                  disabled={createJobMut.isPending}
                  style={{flex:2,padding:16,borderRadius:14,backgroundColor:T.brandGreen,alignItems:'center'}}>
                  {createJobMut.isPending ? <ActivityIndicator color="#FFF"/> : <Text style={{color:'#FFF',fontWeight:'700',fontSize:15}}>Create Job</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
