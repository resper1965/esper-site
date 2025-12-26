'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Play,
  ExternalLink,
  Info,
  BookOpen,
  CreditCard
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
          modelsAvailable: 100,
        });
      }
    } catch {
      // Ignorar erro
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border flex items-center ${
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

        {/* O que é AI Gateway - Explicação */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>O que é o Vercel AI Gateway?</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Entenda como funciona e como configurar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 text-sm leading-relaxed">
                O <strong className="text-slate-100">Vercel AI Gateway</strong> é um serviço que permite acessar 
                <strong className="text-primary"> 100+ modelos de IA</strong> através de uma única API unificada. 
                Em vez de configurar chaves individuais para cada provedor (Google, Anthropic, OpenAI, etc.), 
                você usa apenas uma chave do AI Gateway.
              </p>
              
              <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <h4 className="text-sm font-semibold text-slate-100 mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-primary" />
                  Como Funciona:
                </h4>
                <ol className="text-sm text-slate-300 space-y-2 ml-6 list-decimal">
                  <li>Você obtém uma <strong>chave API do AI Gateway</strong> no dashboard da Vercel</li>
                  <li>Configura essa chave única aqui no painel admin</li>
                  <li>A aplicação usa essa chave para acessar qualquer modelo via formato <code className="bg-slate-900 px-1 rounded text-primary">provider/model</code></li>
                  <li>O AI Gateway roteia automaticamente para o provedor correto</li>
                  <li>Você pode usar fallback automático entre modelos se um falhar</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Como Obter a Chave */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>Como Obter a Chave API</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Passo a passo para obter sua chave no dashboard da Vercel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-100 mb-1">
                    Acesse o Dashboard da Vercel
                  </p>
                  <p className="text-xs text-slate-400">
                    Faça login na sua conta Vercel e navegue até o projeto <strong className="text-slate-300">esper-site</strong>
                  </p>
                  <a
                    href="https://vercel.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                  >
                    Abrir Dashboard da Vercel <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-100 mb-1">
                    Navegue até AI Gateway
                  </p>
                  <p className="text-xs text-slate-400">
                    No menu lateral, clique em <strong className="text-slate-300">&quot;AI Gateway&quot;</strong> ou acesse diretamente:
                  </p>
                  <a
                    href="https://vercel.com/nessbr-projects/esper-site/ai-gateway"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                  >
                    Abrir AI Gateway no Dashboard <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-100 mb-1">
                    Copie a Chave API
                  </p>
                  <p className="text-xs text-slate-400">
                    No dashboard do AI Gateway, você encontrará sua chave API no formato <code className="bg-slate-900 px-1 rounded text-primary">vck_...</code>. 
                    Clique em <strong className="text-slate-300">&quot;Show&quot;</strong> ou <strong className="text-slate-300">&quot;Reveal&quot;</strong> para visualizar e copiar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                  4
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-100 mb-1">
                    Cole a Chave Aqui
                  </p>
                  <p className="text-xs text-slate-400">
                    Cole a chave copiada no campo abaixo e clique em <strong className="text-slate-300">&quot;Salvar&quot;</strong>. 
                    A chave será armazenada de forma segura no Supabase.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-xs text-slate-300 flex items-start gap-2">
                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Importante:</strong> A chave do AI Gateway é diferente das chaves dos provedores individuais. 
                  Você não precisa configurar chaves do Google Gemini, Anthropic, OpenAI, etc. - apenas a chave do AI Gateway.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Status da Conexão</CardTitle>
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
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                {gatewayStatus?.connected
                  ? 'AI Gateway está configurado e pronto para uso'
                  : 'Configure a chave API para conectar ao AI Gateway'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Modelos Disponíveis</CardTitle>
                <Zap className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-100 mb-2">
                {gatewayStatus?.modelsAvailable || 100}+
              </div>
              <p className="text-sm text-slate-400">
                Modelos de IA acessíveis via AI Gateway
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Último Teste</CardTitle>
                <Activity className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-400">
                {gatewayStatus?.lastTest
                  ? new Date(gatewayStatus.lastTest).toLocaleString('pt-BR')
                  : 'Nenhum teste realizado'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-400" />
              <CardTitle>Configuração da Chave API</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Cole a chave API obtida no dashboard da Vercel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                <Key className="h-4 w-4 inline mr-1" />
                Chave API do AI Gateway (vck_...)
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
                  aria-label={showApiKey ? 'Ocultar chave' : 'Mostrar chave'}
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
              <p className="mt-2 text-xs text-slate-400">
                Formato esperado: <code className="bg-slate-800 px-1 rounded text-slate-300">vck_...</code>
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
          </CardContent>
        </Card>

        {/* Models Info */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle>Modelos Suportados</CardTitle>
            <CardDescription className="text-slate-400">
              Exemplos de modelos disponíveis via AI Gateway
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                documentação completa <ExternalLink className="h-3 w-3" />
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Benefícios do AI Gateway</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                <span><strong>Unificação:</strong> Acesso a 100+ modelos através de uma única API e uma única chave</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                <span><strong>Resiliência:</strong> Fallback automático entre modelos se um falhar</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                <span><strong>Monitoramento:</strong> Dashboard na Vercel para acompanhar uso e custos em tempo real</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                <span><strong>Custo:</strong> 0% markup - tokens custam o mesmo que diretamente do provider</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                <span><strong>BYOK:</strong> Suporte a Bring Your Own Key para reduzir custos ainda mais</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Links Úteis */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <a
            href="https://vercel.com/ai-gateway"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 hover:underline inline-flex items-center gap-1"
          >
            <BookOpen className="h-4 w-4" />
            Documentação do AI Gateway
          </a>
          <a
            href="https://vercel.com/nessbr-projects/esper-site/ai-gateway"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 hover:underline inline-flex items-center gap-1"
          >
            <CreditCard className="h-4 w-4" />
            Dashboard na Vercel
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
