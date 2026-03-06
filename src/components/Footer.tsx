import { motion } from "framer-motion";
import Logo from '@/components/Logo';
import { Mail, Phone, Instagram, Youtube, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/context/ContentContext";

export default function Footer() {
  const { content, isEditing, setActiveEditSection } = useContent();
  const data = content?.footer;

  if (!data) return null;

  return (
    <footer className="bg-neutral-950 text-white py-16 px-6 md:px-12 lg:px-24 border-t border-white/10 relative group">
      {isEditing && (
        <div className="absolute top-6 right-6 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button onClick={() => setActiveEditSection('footer')} variant="secondary" size="sm" className="shadow-lg">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Footer
          </Button>
        </div>
      )}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center md:items-start"
        >
          <Logo
            alt={data.copyright}
            loading="lazy"
            decoding="async"
            style={{ 
              width: data.logoWidth ? (isNaN(Number(data.logoWidth)) ? data.logoWidth : `${data.logoWidth}px`) : undefined,
              height: data.logoHeight ? (isNaN(Number(data.logoHeight)) ? data.logoHeight : `${data.logoHeight}px`) : undefined,
              objectFit: data.logoFit as any,
              objectPosition: data.logoPosition
            }}
            className="max-w-full mb-4"
          />
          <p className="text-neutral-500 text-sm tracking-widest uppercase">
            {data.name}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center md:items-end gap-4"
        >
          <div className="flex items-center gap-6">
            <a
              href={`mailto:${data.email}`}
              className="text-neutral-400 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a
              href={`tel:${data.phone}`}
              className="text-neutral-400 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              aria-label="Phone"
            >
              <Phone className="w-5 h-5" />
            </a>
            <a
              href={data.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={data.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
          <p className="text-neutral-600 text-xs">
            &copy; {new Date().getFullYear()} {data.copyright}. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
