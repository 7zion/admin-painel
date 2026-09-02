import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart2, MapPin, Smartphone, Share2, Globe, Calendar, Filter, Activity, Users, Monitor, MousePointer2, MessageCircle, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell , BarChart, Bar, Legend } from 'recharts';

interface Visit {
  id: string;
  visitorId: string;
  sessionId?: string;
  path: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  device: string;
  browser: string;
  os: string;
  country: string;
  region: string;
  city: string;
  timestamp: any;
  isNewSession: boolean;
}

interface AnalyticsEvent {
  id: string;
  eventName: string;
  visitorId: string;
  sessionId: string;
  timestamp: any;
  [key: string]: any;
}

export function MarketingControl() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'custom' | 'all'>('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isModuleEnabled, setIsModuleEnabled] = useState(true);
  const [selectedUtmCampaign, setSelectedUtmCampaign] = useState<string>('all');

  useEffect(() => {
    // timestamp vem como string ISO do Postgres; embrulhamos num objeto com .toDate()
    // pra não precisar reescrever todo o resto do arquivo (que assume Timestamp do Firestore).
    const rowToVisit = (row: any): Visit => ({
      id: row.id,
      ...(row.payload || {}),
      timestamp: { toDate: () => new Date(row.timestamp) },
    });
    const rowToEvent = (row: any): AnalyticsEvent => ({
      id: row.id,
      ...(row.payload || {}),
      timestamp: { toDate: () => new Date(row.timestamp) },
    });

    const loadSettings = async () => {
      const { data } = await supabase.from('settings').select('data').eq('id', 'marketingModule').maybeSingle();
      if (data) setIsModuleEnabled(data.data?.isEnabled !== false);
    };

    const loadVisits = async () => {
      const { data, error } = await supabase.from('analytics').select('*').order('timestamp', { ascending: false });
      if (error) { console.error(error); setLoading(false); return; }
      setVisits((data || []).map(rowToVisit));
      setLoading(false);
    };

    const loadEvents = async () => {
      const { data, error } = await supabase.from('analytics_events').select('*').order('timestamp', { ascending: false });
      if (error) { console.error(error); return; }
      setEvents((data || []).map(rowToEvent));
    };

    loadSettings();
    loadVisits();
    loadEvents();

    const channel = supabase
      .channel('marketing-control-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.marketingModule' }, loadSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics' }, loadVisits)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics_events' }, loadEvents)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleModule = async () => {
    const { data: current } = await supabase.from('settings').select('data').eq('id', 'marketingModule').maybeSingle();
    await supabase.from('settings').upsert({
      id: 'marketingModule',
      data: { ...(current?.data || {}), isEnabled: !isModuleEnabled },
    });
  };

  // Filtrar os dados por data e campanha UTM
  const filteredVisits = visits.filter(v => {
    // UTM Filter
    if (selectedUtmCampaign !== 'all' && v.utm_campaign !== selectedUtmCampaign) return false;

    if (dateFilter === 'all') return true;
    if (!v.timestamp) return false;
    
    // timestamp is a firestore Timestamp object usually, we convert it
    const date = typeof v.timestamp.toDate === 'function' ? v.timestamp.toDate() : new Date();
    
    if (dateFilter === 'custom') {
       if (startDate && new Date(date) < new Date(startDate)) return false;
       if (endDate && new Date(date) > new Date(endDate + 'T23:59:59')) return false;
       return true;
    }

    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (dateFilter === 'today') return diffDays <= 1; // within 24h
    if (dateFilter === '7days') return diffDays <= 7;
    if (dateFilter === '30days') return diffDays <= 30;
    
    return true;
  });

  const filteredEvents = events.filter(e => {
     if (!e.timestamp) return false;
     const v = filteredVisits.find(visit => visit.sessionId === e.sessionId || visit.visitorId === e.visitorId);
     return !!v; // Only include events that match our filtered visits
  });

  // Métricas calculadas
  const totalVisits = filteredVisits.length;
  const uniqueVisitors = new Set(filteredVisits.map(v => v.visitorId)).size;
  const totalChatClicks = filteredEvents.filter(e => e.eventName === 'chat_widget_click' || e.eventName === 'whatsapp_click').length;
  const ctr = totalVisits > 0 ? ((totalChatClicks / totalVisits) * 100).toFixed(1) : '0.0';

  // Fontes de tráfego UTM
  const utmSources = filteredVisits.reduce((acc: Record<string, number>, v) => {
    const source = v.utm_source || 'Orgânico / Direto';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const utmChartData = (Object.entries(utmSources) as [string, number][])
    .sort((a,b) => b[1] - a[1])
    .slice(0, 10)
    .map(([source, count]) => {
      const sourceVisits = filteredVisits.filter(v => (v.utm_source || 'Orgânico / Direto') === source);
      const sessionIds = sourceVisits.map(v => v.sessionId).filter(Boolean);
      const visitorIds = sourceVisits.map(v => v.visitorId).filter(Boolean);
      
      const chatClicks = filteredEvents.filter(e => 
        e.eventName === 'chat_widget_click' && 
        (sessionIds.includes(e.sessionId) || visitorIds.includes(e.visitorId))
      ).length;

      const whatsappClicks = filteredEvents.filter(e => 
        e.eventName === 'whatsapp_click' && 
        (sessionIds.includes(e.sessionId) || visitorIds.includes(e.visitorId))
      ).length;

      return {
        name: source,
        Visitas: count,
        Chat: chatClicks,
        WhatsApp: whatsappClicks
      };
    });

  const utmCampaigns = filteredVisits.reduce((acc, v) => {
    if (v.utm_campaign) {
      acc[v.utm_campaign] = (acc[v.utm_campaign] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const deviceData = filteredVisits.reduce((acc, v) => {
    const dev = v.device || 'Desconhecido';
    acc[dev] = (acc[dev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const geoData = filteredVisits.reduce((acc: Record<string, number>, v) => {
    const loc = `${v.city ? v.city + ', ' : ''}${v.region || ''} ${v.country || ''}`.trim() || 'Desconhecido';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Chart data
  // 1. Traffic by Hour (for Retention/Peaks)
  const trafficByHour = filteredVisits.reduce((acc, v) => {
    if (v.timestamp && typeof v.timestamp.toDate === 'function') {
      const hour = v.timestamp.toDate().getHours();
      acc[hour] = (acc[hour] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);
  const hourlyChartData = Array.from({length: 24}).map((_, i) => ({
    name: `${i}h`,
    acessos: trafficByHour[i] || 0
  }));

  // 2. Traffic over time (Line chart)
  const trafficByDay = filteredVisits.reduce((acc, v) => {
    if (v.timestamp && typeof v.timestamp.toDate === 'function') {
      const dateStr = v.timestamp.toDate().toLocaleDateString('pt-BR');
      acc[dateStr] = (acc[dateStr] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const lineChartData = Object.entries(trafficByDay).reverse().map(([date, count]) => ({
      date,
      visitas: count
  }));

  const pieColors = ['#818cf8', '#34d399', '#f87171', '#fbbf24', '#c084fc'];
  const devicePieData = Object.entries(deviceData).map(([name, value]) => ({ name, value }));

  const exportCSV = () => {
    if (filteredVisits.length === 0) return;
    
    // Headers
    const headers = ['Data', 'Visitante', 'Página', 'Source', 'Medium', 'Campaign', 'Dispositivo', 'Navegador', 'Localização'];
    const rows = filteredVisits.map(v => [
      v.timestamp && typeof v.timestamp.toDate === 'function' ? v.timestamp.toDate().toLocaleString('pt-BR') : '',
      v.visitorId,
      v.path,
      v.utm_source || 'Organico',
      v.utm_medium,
      v.utm_campaign,
      v.device,
      v.browser,
      `${v.city} - ${v.country}`.replace(',', '') // avoid breaking CSV
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio-marketing-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#0b0b0b] p-6 rounded-2xl border border-white/5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="text-indigo-400" />
            Marketing & Analytics UTM
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitore o tráfego, origens de visitas, tracking de chat e funil de conversão.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl">
             <span className={`text-sm font-semibold transition-colors ${isModuleEnabled ? 'text-indigo-400' : 'text-gray-500'}`}>
              Rastreamento Ativo
            </span>
            <button
              onClick={toggleModule}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isModuleEnabled ? 'bg-indigo-500' : 'bg-white/10'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isModuleEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          <select
            value={selectedUtmCampaign}
            onChange={(e) => setSelectedUtmCampaign(e.target.value)}
            className="bg-[#121212] border border-white/10 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todas Campanhas</option>
            {Object.keys(utmCampaigns).map(camp => (
              <option key={camp} value={camp}>{camp}</option>
            ))}
          </select>

          <div className="flex bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
             <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-transparent text-white text-sm px-4 py-2 cursor-pointer focus:outline-none"
             >
                <option value="today">Hoje</option>
                <option value="7days">Últimos 7 dias</option>
                <option value="30days">Últimos 30 dias</option>
                <option value="custom">Personalizado</option>
                <option value="all">Todo o período</option>
             </select>
          </div>

          {dateFilter === 'custom' && (
             <div className="flex items-center gap-2">
               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-[#121212] border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none" />
               <span className="text-gray-500">até</span>
               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-[#121212] border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none" />
             </div>
          )}

          <button onClick={exportCSV} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-medium px-4 py-2 rounded-xl text-sm border border-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>

        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 animate-pulse">Processando métricas...</div>
      ) : (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#0b0b0b] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <MousePointer2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Acessos Totais</p>
                <p className="text-3xl font-bold text-white">{totalVisits}</p>
              </div>
            </div>
            
            <div className="bg-[#0b0b0b] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Visitantes Únicos</p>
                <p className="text-3xl font-bold text-white">{uniqueVisitors}</p>
              </div>
            </div>

            <div className="bg-[#0b0b0b] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-[#25D366]/10 rounded-xl text-[#25D366]">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliques no WhatsApp</p>
                <p className="text-3xl font-bold text-white">{totalChatClicks}</p>
              </div>
            </div>

            <div className="bg-[#0b0b0b] border border-white/5 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent to-amber-500/5 pointer-events-none"></div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 relative z-10">
                <Activity className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CTR (Conversão Chat)</p>
                <p className="text-3xl font-bold text-white">{ctr}%</p>
              </div>
            </div>
          </div>

          {/* Graphics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 bg-[#0b0b0b] border border-white/5 rounded-2xl p-6">
               <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Tráfego ao Longo do Tempo
              </h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Line type="monotone" dataKey="visitas" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6 flex flex-col">
               <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                Dispositivos
              </h2>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={devicePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {devicePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                 {devicePieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }}></div>
                      {entry.name} ({entry.value})
                    </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* UTM Sources e Click-Through to Chat */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                Origem do Tráfego & Conversão (UTM Source)
              </h2>
              <div className="space-y-4 pt-2">
                {(Object.entries(utmSources) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([source, count]) => {
                  // Track conversions for this source
                  const sourceVisits = filteredVisits.filter(v => (v.utm_source || 'Orgânico / Direto') === source);
                  const sessionIds = sourceVisits.map(v => v.sessionId).filter(Boolean);
                  const visitorIds = sourceVisits.map(v => v.visitorId).filter(Boolean);
                  
                  const sourceChatClicks = filteredEvents.filter(e => 
                    (e.eventName === 'chat_widget_click' || e.eventName === 'whatsapp_click') && 
                    (sessionIds.includes(e.sessionId) || visitorIds.includes(e.visitorId))
                  ).length;
                  
                  const sourceCtr = count > 0 ? ((sourceChatClicks / count) * 100).toFixed(1) : '0.0';

                  return (
                    <div key={source} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300 font-medium">{source}</span>
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span className="text-gray-400"><span className="text-white font-bold">{count}</span> visitas</span>
                          <span className="text-gray-400"><span className="text-[#25D366] font-bold">{sourceChatClicks}</span> chats ({sourceCtr}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / totalVisits) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(utmSources).length === 0 && <p className="text-gray-500 text-sm">Sem dados suficientes.</p>}
              </div>
            </div>

            {/* Picos de Horário / Retenção da LP */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6">
               <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-emerald-400" />
                Volume de Acessos por Hora
              </h2>
              <div className="h-[200px] w-full pt-4">
                 <ResponsiveContainer width="100%" height="100%">
                  <div className="w-full h-full"> {/* using custom DOM bar chart */}
                    <div className="flex h-full items-end gap-1 px-2">
                       {hourlyChartData.map((d, i) => {
                          const max = Math.max(...hourlyChartData.map(h => h.acessos)) || 1;
                          const heightPct = (d.acessos / max) * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group relative">
                              {d.acessos > 0 && <div className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">{d.acessos}</div>}
                              <div className="w-full bg-emerald-500/20 rounded-sm hover:bg-emerald-500/40 transition-colors" style={{ height: `${heightPct}%`, minHeight: d.acessos > 0 ? '4px' : '0' }}></div>
                              <span className="text-[9px] text-gray-500 uppercase">{i}h</span>
                            </div>
                          )
                       })}
                    </div>
                  </div>
                 </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Chart UTM vs Clicks */}
          <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-400" />
              Conversões por Origem (UTM x Chat/WhatsApp)
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utmChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: '#ffffff05' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="Visitas" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Chat" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="WhatsApp" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Localização e Tabela */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-400" />
                Localização (Top 5)
              </h2>
              <div className="space-y-3">
                {(Object.entries(geoData) as [string, number][]).sort((a,b) => b[1] - a[1]).slice(0,5).map(([loc, count], i) => (
                  <div key={loc} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 font-medium truncate pr-4 flex items-center gap-2">
                      <span className="text-rose-500/50 text-xs font-bold w-4">{i+1}.</span>
                      {loc}
                    </span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 bg-[#0b0b0b] border border-white/5 rounded-2xl p-6 overflow-hidden">
               <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  Últimos 10 Acessos Registrados
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="pb-3 pr-4 font-semibold">Data/Hora</th>
                        <th className="pb-3 px-4 font-semibold">Página</th>
                        <th className="pb-3 px-4 font-semibold">Campanha (UTM)</th>
                        <th className="pb-3 pl-4 font-semibold">Local (IP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredVisits.slice(0, 10).map(v => (
                        <tr key={v.id} className="text-sm text-gray-300 hover:bg-white/[0.02]">
                          <td className="py-3 pr-4 whitespace-nowrap text-xs text-gray-400">
                            {v.timestamp && typeof v.timestamp.toDate === 'function' ? v.timestamp.toDate().toLocaleString('pt-BR') : 'Agora'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-indigo-300">{v.path}</td>
                          <td className="py-3 px-4">
                             {v.utm_campaign || v.utm_source ? (
                               <div className="flex flex-col">
                                 <span className="text-emerald-400 text-xs font-bold">{v.utm_campaign || '-'}</span>
                                 <span className="text-gray-500 text-[10px] uppercase">{v.utm_source}</span>
                               </div>
                             ) : (
                               <span className="text-gray-500 text-xs">Orgânico</span>
                             )}
                          </td>
                          <td className="py-3 pl-4 text-xs text-gray-400">
                            {v.city ? `${v.city}, ` : ''}{v.country}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
