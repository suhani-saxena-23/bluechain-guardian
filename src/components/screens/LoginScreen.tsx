import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Leaf, Shield, ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { UserRole } from '@/types';

interface FormData {
  name: string;
  registrationNumber: string;
  password: string;
}

const tabs: { id: UserRole; label: string; icon: React.ReactNode }[] = [
  { id: 'generator', label: 'Generator', icon: <Leaf className="w-4 h-4" /> },
  { id: 'validator', label: 'Validator', icon: <Shield className="w-4 h-4" /> },
  { id: 'consumer', label: 'Consumer', icon: <ShoppingCart className="w-4 h-4" /> },
];

const LoginScreen: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [activeRole, setActiveRole] = useState<UserRole>('generator');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    registrationNumber: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = activeRole === 'consumer' ? 'Company name is required' : 'Organization name is required';
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = activeRole === 'consumer' ? 'Business registration number is required' : 'Registration number is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    showToast('success', 'Login Successful', 'Welcome Back!');
    setActiveTab(activeRole);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getFieldLabels = () => {
    if (activeRole === 'consumer') {
      return {
        name: 'Company Legal Name',
        registration: 'Business Registration Number / Tax ID',
      };
    }
    return {
      name: 'Organization Name',
      registration: 'Registration / Charity Number',
    };
  };

  const labels = getFieldLabels();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="gradient-header pt-12 pb-6 px-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('home')}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Login</h1>
            <p className="text-white/70 text-xs">Access your account</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-3 relative z-10">
        <div className="bg-card rounded-xl p-1.5 shadow-lg flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveRole(tab.id);
                setErrors({});
                setFormData({ name: '', registrationNumber: '', password: '' });
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeRole === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.form
            key={activeRole}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {activeRole === 'validator' ? (
              <div className="card-elevated p-6 text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Validator Login</h3>
                <p className="text-sm text-muted-foreground">
                  Validator access is invite-only. Please contact the administrator for credentials.
                </p>
              </div>
            ) : (
              <>
                {/* Organization/Company Name */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">{labels.name} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`input-field ${errors.name ? 'border-destructive' : ''}`}
                    placeholder={activeRole === 'consumer' ? 'Enter company name' : 'Enter organization name'}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Registration Number */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">{labels.registration} *</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    className={`input-field ${errors.registrationNumber ? 'border-destructive' : ''}`}
                    placeholder="Enter registration number"
                  />
                  {errors.registrationNumber && (
                    <p className="text-xs text-destructive mt-1">{errors.registrationNumber}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`input-field pr-10 ${errors.password ? 'border-destructive' : ''}`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary mt-6 disabled:opacity-50"
                >
                  {isSubmitting ? 'Logging In...' : 'Login'}
                </button>

                {/* Link to Sign In */}
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </>
            )}
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginScreen;
