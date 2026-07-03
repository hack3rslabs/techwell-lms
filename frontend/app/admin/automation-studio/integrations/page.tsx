"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function IntegrationsManager() {
  const [integrations, setIntegrations] = useState([]);
  const [provider, setProvider] = useState("TWILIO");
  
  // WhatsApp QR State
  const [waStatus, setWaStatus] = useState({ connected: false, qrCode: null });

  // Form States
  const [twilioForm, setTwilioForm] = useState({ accountSid: '', authToken: '', fromNumber: '' });
  const [smtpForm, setSmtpForm] = useState({ host: '', port: '587', user: '', pass: '', fromEmail: '' });
  const [metaWaForm, setMetaWaForm] = useState({ accessToken: '', phoneNumberId: '', businessAccountId: '' });
  const [openAiForm, setOpenAiForm] = useState({ apiKey: '', model: 'gpt-4o-mini' });

  useEffect(() => {
    fetchIntegrations();
    
    // Poll WhatsApp Web Status
    const waInterval = setInterval(() => {
      fetch('/api/admin/automation-studio/integrations/whatsapp-qr')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setWaStatus(data.data);
          }
        }).catch(err => console.error(err));
    }, 3000);

    return () => clearInterval(waInterval);
  }, []);

  const fetchIntegrations = () => {
    fetch('/api/admin/automation-studio/integrations')
      .then(res => res.json())
      .then(data => {
        if (data.success) setIntegrations(data.data);
      });
  };

  const handleSave = async () => {
    let configPayload = {};

    if (provider === 'TWILIO') configPayload = twilioForm;
    if (provider === 'SMTP') configPayload = smtpForm;
    if (provider === 'META_WHATSAPP') configPayload = metaWaForm;
    if (provider === 'OPENAI') configPayload = openAiForm;

    try {
      const res = await fetch('/api/admin/automation-studio/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          config: configPayload,
          isActive: true
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${provider} Integration saved successfully!`);
        fetchIntegrations();
        // Clear forms
        setTwilioForm({ accountSid: '', authToken: '', fromNumber: '' });
        setSmtpForm({ host: '', port: '587', user: '', pass: '', fromEmail: '' });
        setMetaWaForm({ accessToken: '', phoneNumberId: '', businessAccountId: '' });
        setOpenAiForm({ apiKey: '', model: 'gpt-4o-mini' });
      } else {
        toast.error("Error saving: " + data.error);
      }
    } catch (e) {
      toast.error("Failed to connect to server");
    }
  };

  const handleDelete = async (providerName: string) => {
      // In a real app, you'd add a DELETE endpoint. For now we just mark inactive or notify.
      toast.info(`Delete functionality for ${providerName} coming soon!`);
  }

  const handleWaLogout = async () => {
    await fetch('/api/admin/automation-studio/integrations/whatsapp-logout', { method: 'POST' });
    toast.success("Logged out of WhatsApp Web");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
            Integrations Manager
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Securely connect your communication APIs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Connection</h2>
            
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Provider</label>
                <select 
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm bg-gray-50 text-gray-800 font-medium"
                  value={provider} 
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="TWILIO">Twilio (Voice & SMS)</option>
                  <option value="WHATSAPP_WEB">WhatsApp (Scan QR Code)</option>
                  <option value="META_WHATSAPP">WhatsApp (Meta Cloud API)</option>
                  <option value="SMTP">Email (SMTP / SendGrid)</option>
                  <option value="OPENAI">OpenAI (ChatGPT & LLM)</option>
                </select>
              </div>

              {provider === 'WHATSAPP_WEB' ? (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col items-center justify-center space-y-4">
                  {waStatus.connected ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-2xl font-bold">✓</span>
                      </div>
                      <h3 className="font-bold text-lg text-green-700">WhatsApp is Connected!</h3>
                      <button onClick={handleWaLogout} className="text-sm text-red-500 underline hover:text-red-700 mt-2">Disconnect Device</button>
                    </>
                  ) : waStatus.qrCode ? (
                    <>
                      <h3 className="font-bold text-gray-700">Scan QR Code with WhatsApp</h3>
                      <img src={waStatus.qrCode} alt="WhatsApp QR Code" className="w-64 h-64 border p-2 bg-white rounded-lg shadow-sm" />
                      <p className="text-sm text-gray-500 text-center mt-2">Open WhatsApp on your phone &gt; Linked Devices &gt; Link a device.</p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <span className="animate-spin text-3xl mb-2">⏳</span>
                      <p className="text-gray-500">Generating QR Code...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
                  
                  {provider === 'TWILIO' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Account SID</label>
                        <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={twilioForm.accountSid} onChange={e => setTwilioForm({...twilioForm, accountSid: e.target.value})} placeholder="ACxxxxxxxxxxxxxx" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Auth Token</label>
                        <input type="password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={twilioForm.authToken} onChange={e => setTwilioForm({...twilioForm, authToken: e.target.value})} placeholder="••••••••••••••••" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Twilio Phone Number</label>
                        <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={twilioForm.fromNumber} onChange={e => setTwilioForm({...twilioForm, fromNumber: e.target.value})} placeholder="+1234567890" />
                      </div>
                    </>
                  )}

                  {provider === 'SMTP' && (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">SMTP Host</label>
                          <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={smtpForm.host} onChange={e => setSmtpForm({...smtpForm, host: e.target.value})} placeholder="smtp.sendgrid.net" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Port</label>
                          <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={smtpForm.port} onChange={e => setSmtpForm({...smtpForm, port: e.target.value})} placeholder="587" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Username / API Key Name</label>
                        <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={smtpForm.user} onChange={e => setSmtpForm({...smtpForm, user: e.target.value})} placeholder="apikey" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password / API Key</label>
                        <input type="password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={smtpForm.pass} onChange={e => setSmtpForm({...smtpForm, pass: e.target.value})} placeholder="••••••••••••••••" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Sender Email Address</label>
                        <input type="email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={smtpForm.fromEmail} onChange={e => setSmtpForm({...smtpForm, fromEmail: e.target.value})} placeholder="noreply@techwell.co.in" />
                      </div>
                    </>
                  )}

                  {provider === 'META_WHATSAPP' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Permanent Access Token</label>
                        <input type="password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={metaWaForm.accessToken} onChange={e => setMetaWaForm({...metaWaForm, accessToken: e.target.value})} placeholder="EAA..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone Number ID</label>
                        <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={metaWaForm.phoneNumberId} onChange={e => setMetaWaForm({...metaWaForm, phoneNumberId: e.target.value})} placeholder="123456789" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Business Account ID</label>
                        <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={metaWaForm.businessAccountId} onChange={e => setMetaWaForm({...metaWaForm, businessAccountId: e.target.value})} placeholder="987654321" />
                      </div>
                    </>
                  )}

                  {provider === 'OPENAI' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">OpenAI API Key</label>
                        <input type="password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={openAiForm.apiKey} onChange={e => setOpenAiForm({...openAiForm, apiKey: e.target.value})} placeholder="sk-..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Default Model</label>
                        <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" value={openAiForm.model} onChange={e => setOpenAiForm({...openAiForm, model: e.target.value})}>
                          <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cheap)</option>
                          <option value="gpt-4o">gpt-4o (Powerful)</option>
                          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-4">
                    <button 
                      onClick={handleSave}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                      Connect & Save Configuration
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Integrations</h2>
          
          <div className="flex-1 overflow-y-auto">
            {integrations.length === 0 && !waStatus.connected ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <span className="text-5xl mb-4 opacity-50">🔌</span>
                <p className="font-medium">No active API connections.</p>
                <p className="text-sm mt-1">Configure a provider on the left to get started.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {waStatus.connected && (
                  <li className="flex justify-between items-center p-5 bg-gradient-to-r from-green-50 to-white border border-green-100 rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xl">✓</div>
                      <div>
                        <span className="font-bold text-gray-800 text-lg block">WhatsApp Web Client</span>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full uppercase tracking-wide">Connected via QR</span>
                      </div>
                    </div>
                    <button onClick={handleWaLogout} className="text-red-400 hover:text-red-600 transition-colors p-2 text-sm font-semibold bg-red-50 rounded-lg">Logout</button>
                  </li>
                )}
                {integrations.map((intg: any) => (
                  <li key={intg.id} className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                        ✓
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-lg block">{intg.provider}</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full uppercase tracking-wide">
                          {intg.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(intg.provider)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
