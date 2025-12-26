'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Settings, Key, Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EnvVariable {
  key: string;
  value: string;
  masked: boolean;
  description: string;
  category: 'ai' | 'database' | 'security' | 'other';
}

export default function SettingsPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({});
  const [saving, setSaving] = useState(false);
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
          loadSettings();
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.success) {
        setEnvVars(data.settings || []);
      } else {
        // Se não existir, inicializar com valores padrão
        initializeDefaultSettings();
      }
    } catch {
      initializeDefaultSettings();
    }
  };

  const initializeDefaultSettings = () => {
    const defaultVars: EnvVariable[] = [
      {
        key: 'AI_GATEWAY_API_KEY',
        value: '',
        masked: true,
        description: 'Chave API do Vercel AI Gateway para acesso a múltiplos modelos de IA',
        category: 'ai',
      },
      {
        key: 'GEMINI_API_KEY',
        value: '',
        masked: true,
        description: 'Chave API do Google Gemini (opcional, pode usar BYOK no AI Gateway)',
        category: 'ai',
      },
      {
        key: 'ANTHROPIC_API_KEY',
        value: '',
        masked: true,
        description: 'Chave API da Anthropic Claude (opcional, para BYOK no AI Gateway)',
        category: 'ai',
      },
      {
        key: 'OPENAI_API_KEY',
        value: '',
        masked: true,
        description: 'Chave API da OpenAI (opcional, para BYOK no AI Gateway)',
        category: 'ai',
      },
    ];
    setEnvVars(defaultVars);
  };

  const handleEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: editValue }),
      });

      const data = await response.json();

      if (data.success) {
        setEnvVars((prev) =>
          prev.map((v) => (v.key === key ? { ...v, value: editValue } : v))
        );
        setEditingKey(null);
        setEditValue('');
        setMessage({ type: 'success', text: 'Configuração salva com sucesso!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar configuração' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar configuração' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const toggleShowValue = (key: string) => {
    setShowValues((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const maskValue = (value: string) => {
    if (!value) return '';
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      ai: 'Inteligência Artificial',
      database: 'Banco de Dados',
      security: 'Segurança',
      other: 'Outros',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      ai: 'bg-purple-100 text-purple-700 border-purple-200',
      database: 'bg-blue-100 text-blue-700 border-blue-200',
      security: 'bg-red-100 text-red-700 border-red-200',
      other: 'bg-grey-100 text-grey-700 border-grey-200',
    };
    return colors[category] || colors.other;
  };

  if (checkingAuth) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-grey-600 mx-auto mb-3" />
            <p className="text-grey-600">Verificando autenticação...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const groupedVars = envVars.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as { [key: string]: EnvVariable[] });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Settings className="h-8 w-8 text-grey-900 mr-3" />
            <h1 className="text-3xl font-bold text-grey-900">Configurações</h1>
          </div>
          <p className="text-grey-600">
            Gerencie variáveis de ambiente e configurações do sistema
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
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

        {/* Settings by Category */}
        {Object.entries(groupedVars).map(([category, vars]) => (
          <div key={category} className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-grey-900">
                {getCategoryLabel(category)}
              </h2>
              <p className="text-sm text-grey-600 mt-1">
                Configurações relacionadas a {getCategoryLabel(category).toLowerCase()}
              </p>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-grey-200 overflow-hidden">
              <div className="divide-y divide-grey-200">
                {vars.map((envVar) => (
                  <div key={envVar.key} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Key className="h-4 w-4 text-grey-400 mr-2" />
                          <code className="text-sm font-mono font-semibold text-grey-900 bg-grey-50 px-2 py-1 rounded">
                            {envVar.key}
                          </code>
                          <span
                            className={`ml-3 px-2 py-0.5 text-xs font-medium rounded border ${getCategoryColor(
                              envVar.category
                            )}`}
                          >
                            {getCategoryLabel(envVar.category)}
                          </span>
                        </div>
                        <p className="text-sm text-grey-600 mb-3">{envVar.description}</p>

                        {editingKey === envVar.key ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type={showValues[envVar.key] ? 'text' : 'password'}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-grey-900 focus:border-transparent font-mono text-sm"
                                placeholder="Digite o valor..."
                              />
                              <button
                                onClick={() => toggleShowValue(envVar.key)}
                                className="p-2 text-grey-600 hover:text-grey-900 hover:bg-grey-100 rounded-lg transition-colors"
                                type="button"
                              >
                                {showValues[envVar.key] ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleSave(envVar.key)}
                                disabled={saving}
                                className="flex items-center px-4 py-2 bg-grey-900 text-white rounded-lg hover:bg-grey-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {saving ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                Salvar
                              </button>
                              <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-4 py-2 border border-grey-300 text-grey-700 rounded-lg hover:bg-grey-50 transition-colors disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 px-3 py-2 bg-grey-50 border border-grey-200 rounded-lg font-mono text-sm text-grey-700">
                              {envVar.value
                                ? showValues[envVar.key]
                                  ? envVar.value
                                  : maskValue(envVar.value)
                                : '(não configurado)'}
                            </code>
                            <button
                              onClick={() => toggleShowValue(envVar.key)}
                              className="p-2 text-grey-600 hover:text-grey-900 hover:bg-grey-100 rounded-lg transition-colors"
                              type="button"
                            >
                              {showValues[envVar.key] ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(envVar.key, envVar.value)}
                              className="px-4 py-2 border border-grey-300 text-grey-700 rounded-lg hover:bg-grey-50 transition-colors"
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Informação Importante
          </h3>
          <p className="text-sm text-blue-800">
            As configurações são armazenadas de forma segura no Supabase. As chaves são
            criptografadas e usadas em runtime pela aplicação. Para variáveis sensíveis, use
            sempre a interface de administração ao invés de editar arquivos diretamente.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

