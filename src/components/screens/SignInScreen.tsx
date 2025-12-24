import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Leaf, Shield, ShoppingCart, Upload, X, Eye, EyeOff, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { UserRole } from '@/types';

interface FormData {
  organizationName: string;
  registrationNumber: string;
  email: string;
  password: string;
  documents: File[];
}

const tabs: { id: UserRole; label: string; icon: React.ReactNode }[] = [
  { id: 'generator', label: 'Generator', icon: <Leaf className="w-4 h-4" /> },
  { id: 'validator', label: 'Validator', icon: <Shield className="w-4 h-4" /> },
  { id: 'consumer', label: 'Consumer', icon: <ShoppingCart className="w-4 h-4" /> },
];

const SignInScreen: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [activeRole, setActiveRole] = useState<UserRole>('generator');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    registrationNumber: '',
    email: '',
    password: '',
    documents: [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= 8 && hasLetter && hasNumber;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = activeRole === 'consumer' ? 'Company name is required' : 'Organization name is required';
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = activeRole === 'consumer' ? 'Business registration number is required' : 'Registration number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Min 8 characters with letters & numbers';
    }
    if (formData.documents.length === 0 && activeRole !== 'validator') {
      newErrors.documents = 'Please upload at least one document';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    showToast('success', 'Sign In Successful', `Welcome, ${formData.organizationName}!`);
    setActiveTab(activeRole);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
    );
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles],
    }));
    setErrors(prev => ({ ...prev, documents: undefined }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
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
        email: 'Official Email',
        documents: 'Upload Official Documents',
      };
    }
    return {
      name: 'Organization Name',
      registration: 'Registration / Charity Number',
      email: 'Official Email',
      documents: 'Upload Documents',
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
            <h1 className="text-xl font-bold text-white">Sign In</h1>
            <p className="text-white/70 text-xs">Create your account</p>
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
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 scrollbar-hide">
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
                <h3 className="font-semibold text-foreground mb-2">Validator Registration</h3>
                <p className="text-sm text-muted-foreground">
                  Validator registration is currently invite-only. Please contact the administrator for access.
                </p>
              </div>
            ) : (
              <>
                {/* Organization/Company Name */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">{labels.name} *</label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className={`input-field ${errors.organizationName ? 'border-destructive' : ''}`}
                    placeholder={activeRole === 'consumer' ? 'Enter company name' : 'Enter organization name'}
                  />
                  {errors.organizationName && (
                    <p className="text-xs text-destructive mt-1">{errors.organizationName}</p>
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

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">{labels.email} *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`input-field ${errors.email ? 'border-destructive' : ''}`}
                    placeholder="Enter official email"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">{labels.documents} *</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-colors ${
                      errors.documents ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload PDF, JPG, PNG</span>
                  </button>
                  {errors.documents && (
                    <p className="text-xs text-destructive mt-1">{errors.documents}</p>
                  )}
                  
                  {/* Uploaded files list */}
                  {formData.documents.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.documents.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                          <Check className="w-4 h-4 text-success" />
                          <span className="flex-1 text-xs truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
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
                      placeholder="Create a strong password"
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
                  <p className="text-xs text-muted-foreground mt-1">Min 8 characters with letters & numbers</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary mt-6 disabled:opacity-50"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </>
            )}
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignInScreen;
