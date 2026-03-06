import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useContent } from '@/context/ContentContext';

const ContactSection = () => {
  const { toast } = useToast();
  const { content, isEditing, setActiveEditSection } = useContent();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { title, subtitle, description, email, phone, location } = content.contact;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Validation Error', description: 'Please enter your name.', variant: 'destructive' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      toast({ title: 'Validation Error', description: 'Please enter a valid email address.', variant: 'destructive' });
      return false;
    }
    if (!formData.message.trim()) {
      toast({ title: 'Validation Error', description: 'Please enter a message.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      submissions.push({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
      toast({ title: 'Message Sent!', description: "Thank you for reaching out. I'll get back to you soon." });
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: email, href: `mailto:${email}` },
    { icon: Phone, label: 'Phone', value: phone, href: `tel:${phone.replace(/[^0-9+]/g, '')}` },
    { icon: MapPin, label: 'Location', value: location, href: null }
  ];

  return (
    <section id="contact" className="py-24 relative group">
      {isEditing && (
        <div className="absolute top-6 right-6 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button onClick={() => setActiveEditSection('contact')} variant="secondary" size="sm" className="shadow-lg">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Contact
          </Button>
        </div>
      )}
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">{subtitle}</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className="bg-zinc-900/50 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={formData.email} onChange={handleChange} className="bg-zinc-900/50 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" value={formData.message} onChange={handleChange} className="bg-zinc-900/50 border-white/10 min-h-[150px]" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? 'Sending...' : 'Send Message'}
                {!isSubmitting && <Mail className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            </Button>
          </form>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-2">Contact Information</h3>
              <p className="text-gray-400">Feel free to reach out through any of these channels.</p>
            </div>
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                const content = (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/30 border border-white/5 transition-all duration-300 hover:bg-zinc-900/50 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <div className="p-3 bg-white/5 rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/10"><Icon className="w-6 h-6" /></div>
                    <div>
                      <p className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">{info.label}</p>
                      <p className="font-medium transition-colors duration-300 group-hover:text-white">{info.value}</p>
                    </div>
                  </div>
                );
                return (
                  <motion.div key={index} whileHover={{ x: 5 }} className="group">
                    {info.href ? <a href={info.href} className="block">{content}</a> : <div>{content}</div>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
