import { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

// EmailJS configuration - replace with your own keys
const EMAILJS_SERVICE_ID = "service_3jqdlop"; // Твой ID с картинки
const EMAILJS_TEMPLATE_ID = "template_1u9x183"; // Твой ID с картинки
const EMAILJS_PUBLIC_KEY = "JhHvdYgde2UHtavaG"; // Твой ключ с картинки


// Проверка валидности ключей
const isConfigValid = Boolean(
  EMAILJS_SERVICE_ID && 
  EMAILJS_TEMPLATE_ID && 
  EMAILJS_PUBLIC_KEY &&
  !EMAILJS_SERVICE_ID.includes('your_') &&
  !EMAILJS_TEMPLATE_ID.includes('your_') &&
  !EMAILJS_PUBLIC_KEY.includes('your_')
);

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string; // Spam protection
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Debug: логирование переменных окружения
  useEffect(() => {
    console.log('=== EmailJS Config Debug ===');
    console.log('SERVICE:', EMAILJS_SERVICE_ID);
    console.log('TEMPLATE:', EMAILJS_TEMPLATE_ID);
    console.log('KEY:', EMAILJS_PUBLIC_KEY);
    console.log('Config Valid:', isConfigValid);
    console.log('============================');
  }, []);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Пожалуйста, введите ваше имя';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Пожалуйста, введите email';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Пожалуйста, введите корректный email';
    }
    
    // Subject validation (optional but if provided, should be meaningful)
    if (formData.subject && formData.subject.trim().length < 3) {
      newErrors.subject = 'Тема должна содержать минимум 3 символа';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Пожалуйста, введите сообщение';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Сообщение должно содержать минимум 10 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage('Файл слишком большой. Максимальный размер: 5 МБ');
        setStatus('error');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setStatusMessage('Недопустимый тип файла. Разрешены: JPG, PNG, GIF, PDF, TXT');
        setStatus('error');
        return;
      }
    }
    
    setAttachment(file);
    setStatus('idle');
  };

  // Remove attachment
  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Check honeypot (spam protection)
    if (formData.honeypot) {
      console.log('Bot detected');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    // Проверка конфигурации перед отправкой
    if (!isConfigValid) {
      setStatus('error');
      setStatusMessage('Ошибка конфигурации EmailJS. Проверьте файл .env и перезапустите сервер.');
      console.error('EmailJS config invalid! Check .env file.');
      return;
    }
    
    setStatus('submitting');
    
    try {
      // Prepare template parameters
      const templateParams = {
        from_name: formData.name,
        reply_to: formData.email,
        message: formData.message,
      };
      
      // Send main email
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      // Send auto-reply to user
      
      
      setStatus('success');
      setStatusMessage('Спасибо! Ваше письмо отправлено. Я отвечу вам в ближайшее время');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: '',
      });
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: unknown) {
      console.error('Email send error:', error);
      
      // Детальное логирование для отладки
      if (error && typeof error === 'object' && 'text' in error) {
        console.error('EmailJS Error Text:', (error as { text: string }).text);
      }
      if (error && typeof error === 'object' && 'status' in error) {
        console.error('EmailJS Error Status:', (error as { status: number }).status);
      }
      
      setStatus('error');
      
      // Более информативное сообщение об ошибке
      const errorMessage = error && typeof error === 'object' && 'text' in error 
        ? `Ошибка: ${(error as { text: string }).text}`
        : 'Произошла ошибка при отправке. Проверьте консоль браузера для деталей.';
      setStatusMessage(errorMessage);
    }
  };

  return (
    <div className="contact-form-wrapper max-w-lg mx-auto">
      {/* Ошибка конфигурации EmailJS */}
      {!isConfigValid && (
        <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 text-center">
          <strong>⚠️ ОШИБКА:</strong> Проверь файл .env! Ключи EmailJS не найдены или невалидны.
          <div className="text-xs mt-2 text-red-600">
            SERVICE_ID: {EMAILJS_SERVICE_ID || 'не задан'}<br/>
            TEMPLATE_ID: {EMAILJS_TEMPLATE_ID || 'не задан'}<br/>
            PUBLIC_KEY: {EMAILJS_PUBLIC_KEY || 'не задан'}
          </div>
        </div>
      )}

      {/* Postcard styling */}
      <motion.div
        className="relative bg-parchment-50 rounded-sm shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Vintage border */}
        <div className="absolute inset-0 border-8 border-double border-burgundy-200/50 pointer-events-none rounded-sm" />
        
        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-burgundy-300/50" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-burgundy-300/50" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-burgundy-300/50" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-burgundy-300/50" />
        
        {/* Stamp decoration */}
        <div className="absolute top-4 right-4 w-16 h-20 bg-burgundy-100/50 border-2 border-dashed border-burgundy-300/50 
                        flex items-center justify-center transform rotate-3">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-burgundy-400/70" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span className="text-[8px] text-burgundy-500/70 font-serif">ПОЧТА</span>
          </div>
        </div>
        
        {/* Form content */}
        <div className="p-8 pt-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="font-display text-2xl text-burgundy-800 mb-6">
              Письмо автору
            </h3>
            <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-burgundy-400 to-transparent" />
          </div>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot field (hidden) */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleChange}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
            
            {/* Name field */}
            <div className="form-field">
              <label htmlFor="name" className="form-label">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-burgundy-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Ваше имя <span className="text-burgundy-500">*</span>
                </span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Иван Иванов"
                className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                disabled={status === 'submitting'}
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="form-error"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Email field */}
            <div className="form-field">
              <label htmlFor="email" className="form-label">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-burgundy-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Email для ответа <span className="text-burgundy-500">*</span>
                </span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ivan@example.com"
                className={`form-input ${errors.email ? 'border-red-400' : ''}`}
                disabled={status === 'submitting'}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="form-error"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Subject field */}
            <div className="form-field">
              <label htmlFor="subject" className="form-label">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-burgundy-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                  Тема письма
                </span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Отзыв о книге"
                className={`form-input ${errors.subject ? 'border-red-400' : ''}`}
                disabled={status === 'submitting'}
              />
              <AnimatePresence>
                {errors.subject && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="form-error"
                  >
                    {errors.subject}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Message field */}
            <div className="form-field">
              <label htmlFor="message" className="form-label">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-burgundy-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
                  </svg>
                  Сообщение <span className="text-burgundy-500">*</span>
                </span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Ваши мысли, отзывы, вопросы..."
                rows={5}
                className={`form-input resize-none ${errors.message ? 'border-red-400' : ''}`}
                disabled={status === 'submitting'}
              />
              <AnimatePresence>
                {errors.message && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="form-error"
                  >
                    {errors.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* File attachment */}
            <div className="form-field">
              <label className="form-label">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-burgundy-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                  </svg>
                  Прикрепить файл
                </span>
              </label>
              
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
                  className="hidden"
                  id="file-upload"
                  disabled={status === 'submitting'}
                />
                
                {!attachment ? (
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 px-4 py-3 
                               border-2 border-dashed border-burgundy-300/50 rounded-md
                               cursor-pointer hover:border-burgundy-400 hover:bg-burgundy-50/30
                               transition-all duration-200 text-ink-500 text-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    <span>Выберите файл (до 5 МБ)</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 
                                  bg-burgundy-50/50 border border-burgundy-200/50 rounded-md">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <svg className="w-5 h-5 text-burgundy-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
                      </svg>
                      <span className="truncate max-w-[180px]">{attachment.name}</span>
                      <span className="text-ink-400 text-xs">
                        ({(attachment.size / 1024).toFixed(1)} КБ)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="p-1 hover:bg-burgundy-200/50 rounded transition-colors"
                    >
                      <svg className="w-4 h-4 text-ink-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-ink-400 mt-1">
                Форматы: JPG, PNG, GIF, PDF, TXT
              </p>
            </div>
            
            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-cta-submit"
              whileHover={{ scale: status === 'submitting' ? 1 : 1.02 }}
              whileTap={{ scale: status === 'submitting' ? 1 : 0.98 }}
            >
              {status === 'submitting' ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-parchment-100 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Отправить письмо</span>
                </>
              )}
            </motion.button>
          </form>
          
          {/* Status messages */}
          <AnimatePresence>
            {(status === 'success' || status === 'error') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-6 p-4 rounded-md text-center ${
                  status === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  {status === 'success' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  )}
                  <span className="font-semibold">
                    {status === 'success' ? 'Успешно!' : 'Ошибка'}
                  </span>
                </div>
                <p className="text-sm">{statusMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-ink-400 font-serif">
            Все поля, отмеченные <span className="text-burgundy-500">*</span>, обязательны для заполнения
          </p>
        </div>
        
        {/* Postcard lines decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none opacity-20"
             style={{
               backgroundImage: `repeating-linear-gradient(
                 transparent,
                 transparent 19px,
                 #7a1d39 19px,
                 #7a1d39 20px
               )`
             }}
        />
      </motion.div>
    </div>
  );
}
