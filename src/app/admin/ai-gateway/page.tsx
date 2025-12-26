'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  Key, 
  Settings, 
  Activity, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  Save,
  Play
} from 'lucide-react';

interface GatewayStatus {
  connected: boolean;
  apiKeyConfigured: boolean;
  lastTest?: string;
  modelsAvailable: number;
}

export default function AIGatewayPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setCheckingAuth(false);
          loadGatewayStatus();
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadGatewayStatus = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.success) {
        const settings = data.settings || [];
        const gatewayKey = settings.find((s: { key: string }) => s.key === 'AI_GATEWAY_API_KEY');
        
        setApiKey(gatewayKey?.value || '');
        
        setGatewayStatus({
          connected: !!gatewayKey?.value,
          apiKeyConfigured: !!gatewayKey?.value,
          modelsAvailable: 100, // AI Gateway suporta 100+ modelos
        });
      }
    } catch {
      // Ignorar erro - status será null
    }
  };

  const handleSaveApiKey = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          key: 'AI_GATEWAY_API_KEY',
          value: apiKey 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Chave API salva com sucesso!' });
        setGatewayStatus((prev) => prev ? { ...prev, apiKeyConfigured: true, connected: true } : null);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar chave API' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar chave API' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/admin/ai-gateway/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResult({ 
          success: true, 
          message: `Conexão bem-sucedida! Modelo testado: ${data.model || 'google/gemini-2.5-pro'}` 
        });
        setGatewayStatus((prev) => prev ? { 
          ...prev, 
          connected: true,
          lastTest: new Date().toISOString()
        } : null);
      } else {
        setTestResult({ 
          success: false, 
          message: data.error || 'Erro ao testar conexão' 
        });
      }
    } catch {
      setTestResult({ 
        success: false, 
        message: 'Erro ao testar conexão com AI Gateway' 
      });
    } finally {
      setTesting(false);
    }
  };

  if (checkingAuth) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-3" />
            <p className="text-slate-400">Verificando autenticação...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center ${
              message.type === 'success'
                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                : 'bg-red-950/30 border-red-800/50 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 shadow-sm rounded-lg border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Status da Conexão</h3>
              {gatewayStatus?.connected ? (
                <div className="flex items-center text-emerald-400">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Conectado</span>
                </div>
              ) : (
                <div className="flex items-center text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Desconectado</span>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-400">
              {gatewayStatus?.connected
                ? 'AI Gateway está configurado e pronto para uso'
                : 'Configure a chave API para conectar ao AI Gateway'}
            </p>
          </div>

          <div className="bg-slate-900 shadow-sm rounded-lg border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Modelos Disponíveis</h3>
              <Zap className="h-5 w-5 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-100 mb-2">
              {gatewayStatus?.modelsAvailable || 100}+
            </div>
            <p className="text-sm text-slate-400">
              Modelos de IA acessíveis via AI Gateway
            </p>
          </div>

          <div className="bg-slate-900 shadow-sm rounded-lg border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Último Teste</h3>
              <Activity className="h-5 w-5 text-slate-400" />
            </div>
            <div className="text-sm text-slate-400">
              {gatewayStatus?.lastTest
                ? new Date(gatewayStatus.lastTest).toLocaleString('pt-BR')
                : 'Nenhum teste realizado'}
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-slate-900 shadow-sm rounded-lg border border-slate-800 p-6 mb-8">
          <div className="flex items-center mb-6">
            <Settings className="h-5 w-5 text-slate-400 mr-2" />
            <h2 className="text-xl font-semibold text-slate-100">Configuração</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                <Key className="h-4 w-4 inline mr-1" />
                Chave API do AI Gateway
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="vck_..."
                  className="flex-1 px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm placeholder:text-slate-500"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  type="button"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleSaveApiKey}
                  disabled={saving || !apiKey}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Chave API do Vercel AI Gateway. Formato: <code className="bg-slate-800 px-1 rounded text-slate-300">vck_...</code>
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleTestConnection}
                disabled={testing || !apiKey}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {testing ? 'Testando...' : 'Testar Conexão'}
              </button>

              {testResult && (
                <div
                  className={`mt-4 p-4 rounded-lg border flex items-center ${
                    testResult.success
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                      : 'bg-red-950/30 border-red-800/50 text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Models Info */}
        <div className="bg-slate-900 shadow-sm rounded-lg border border-slate-800 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Modelos Suportados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="font-medium text-slate-100 mb-2">Google Gemini</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• <code className="text-primary">google/gemini-2.5-pro</code></li>
                <li>• <code className="text-primary">google/gemini-2.5-flash</code></li>
              </ul>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="font-medium text-slate-100 mb-2">Anthropic Claude</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• <code className="text-primary">anthropic/claude-sonnet-4</code></li>
                <li>• <code className="text-primary">anthropic/claude-3.5-sonnet</code></li>
              </ul>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="font-medium text-slate-100 mb-2">OpenAI</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• <code className="text-primary">openai/gpt-4o</code></li>
                <li>• <code className="text-primary">openai/gpt-4o-mini</code></li>
              </ul>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="font-medium text-slate-100 mb-2">xAI Grok</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• <code className="text-primary">xai/grok-2</code></li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            E mais de 100 modelos disponíveis. Consulte a{' '}
            <a
              href="https://vercel.com/ai-gateway/models"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              documentação completa
            </a>
            .
          </p>
        </div>

        {/* Features */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-slate-200 mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Benefícios do AI Gateway
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
              <span><strong>Unificação:</strong> Acesso a 100+ modelos através de uma única API</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
              <span><strong>Resiliência:</strong> Fallback automático entre modelos se um falhar</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
              <span><strong>Monitoramento:</strong> Dashboard na Vercel para acompanhar uso e custos</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
              <span><strong>Custo:</strong> 0% markup - tokens custam o mesmo que diretamente do provider</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
              <span><strong>BYOK:</strong> Suporte a Bring Your Own Key para reduzir custos</span>
            </li>
          </ul>
        </div>

        {/* Links */}
        <div className="mt-6 flex items-center space-x-4 text-sm text-slate-400">
          <a
            href="https://vercel.com/ai-gateway"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 hover:underline"
          >
            Documentação do AI Gateway →
          </a>
          <a
            href="https://vercel.com/nessbr-projects/esper-site/ai-gateway"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 hover:underline"
          >
            Dashboard na Vercel →
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}

