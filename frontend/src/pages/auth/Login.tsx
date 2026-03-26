import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ✅ Add this
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import LanguageSwitcher from '../../components/common/LangaugeSwitcher';

const Login = () => {
  const { t } = useTranslation(); // ✅ Add this
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || t('auth.invalidCredentials'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Todo: Fix The Login UI and Its multilangauge Functinality
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-secondary">
            {t('auth.enterCredentials')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg">
              <p className="text-sm">{errors.general}</p>
            </div>
          )}

          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="w-full"
          >
            {t('auth.login')}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;