import React from 'react';
import { Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-baby-light to-baby-dark flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-medium text-white">Smart City</span>
          </div>
          <p className="text-lg text-slate-400 font-extralight">
            Platformă de interoperabilitate pentru administrația publică locală
          </p>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <p className="text-lg text-slate-500 font-extralight text-center">
            AI vibe coded development by{' '}
            <a 
              href="https://biela.dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-baby-blue hover:text-baby-light transition-colors"
            >
              Biela.dev
            </a>
            , powered by{' '}
            <a 
              href="https://teachmecode.ae/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-baby-blue hover:text-baby-light transition-colors"
            >
              TeachMeCode® Institute
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
