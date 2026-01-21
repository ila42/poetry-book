import { motion } from 'framer-motion';
import { ContactForm } from '@/components/ContactForm';
import { BookPage } from './BookPage';

interface ContactPageProps {
  pageNumber?: number;
  isLeft?: boolean;
}

export function ContactPage({ pageNumber, isLeft }: ContactPageProps) {
  return (
    <BookPage pageNumber={pageNumber} isLeft={isLeft}>
      <div className="max-w-prose mx-auto overflow-y-auto scrollbar-hide">
        <ContactForm />
        
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-serif text-sm text-ink-500">
            Или напишите напрямую:
          </p>
          <a 
            href="mailto:author@poetrybook.ru" 
            className="font-serif text-burgundy-700 hover:text-burgundy-900 transition-colors"
          >
            author@poetrybook.ru
          </a>
        </motion.div>
      </div>
    </BookPage>
  );
}
