import React, { useState } from 'react';
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { sendContactEmail } from './lib/supabase';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = '제목을 입력해주세요';
    }

    if (!formData.message.trim()) {
      newErrors.message = '메시지를 입력해주세요';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = '메시지는 최소 10자 이상 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setStatus('loading');
    
    try {
      await sendContactEmail(formData);
      
      setStatus('success');
      setStatusMessage('메시지가 성공적으로 전송되었습니다! 빠른 시일 내에 답변드리겠습니다.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Email sending failed:', error);
      setStatus('error');
      setStatusMessage('메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setStatusMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="min-h-screen backdrop-blur-sm bg-white/10 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">문의하기</h1>
            <p className="text-white/80 text-lg">궁금한 점이 있으시면 언제든 연락주세요</p>
          </div>

          {/* Contact Form */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  이름 *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur border rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 ${
                      errors.name ? 'border-red-400' : 'border-white/30'
                    }`}
                    placeholder="성함을 입력해주세요"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-200 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  이메일 *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur border rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 ${
                      errors.email ? 'border-red-400' : 'border-white/30'
                    }`}
                    placeholder="이메일 주소를 입력해주세요"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-200 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-white">
                  제목 *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/20 backdrop-blur border rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 ${
                    errors.subject ? 'border-red-400' : 'border-white/30'
                  }`}
                  placeholder="문의 제목을 입력해주세요"
                />
                {errors.subject && (
                  <p className="text-red-200 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-white">
                  메시지 *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur border rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 resize-none ${
                      errors.message ? 'border-red-400' : 'border-white/30'
                    }`}
                    placeholder="문의 내용을 자세히 적어주세요"
                  />
                </div>
                {errors.message && (
                  <p className="text-red-200 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-white/30 hover:bg-white/40 disabled:bg-white/20 text-white font-semibold py-4 px-6 rounded-lg border border-white/30 hover:border-white/50 transition-all duration-200 backdrop-blur flex items-center justify-center gap-2 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    메시지 전송하기
                  </>
                )}
              </button>
            </form>

            {/* Status Messages */}
            {status === 'success' && (
              <div className="mt-6 p-4 bg-green-500/20 border border-green-400/30 rounded-lg backdrop-blur">
                <div className="flex items-center gap-2 text-green-100">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{statusMessage}</span>
                </div>
                <button
                  onClick={resetStatus}
                  className="mt-2 text-sm text-green-200 hover:text-green-100 underline"
                >
                  새 메시지 작성하기
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur">
                <div className="flex items-center gap-2 text-red-100">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{statusMessage}</span>
                </div>
                <button
                  onClick={resetStatus}
                  className="mt-2 text-sm text-red-200 hover:text-red-100 underline"
                >
                  다시 시도하기
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              또는 직접 이메일로 연락하세요: 
              <a href="mailto:mastery0621@gmail.com" className="text-white hover:text-white/80 underline ml-1">
              mastery0621@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;