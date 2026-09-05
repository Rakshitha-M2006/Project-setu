import React from "react";
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from "../../context/LanguageContext";
import { Globe, Check, X } from "lucide-react";

export const LanguageSelectorModal: React.FC = () => {
  const { language, setLanguage, isLanguageModalOpen, closeLanguageModal, t } = useLanguage();

  if (!isLanguageModalOpen) return null;

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    closeLanguageModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {t("common.chooseLanguage") || "Choose your language"}
              </h2>
              <p className="text-xs text-blue-200">
                {t("common.selectLanguagePrompt") || "Select your preferred language for the citizen portal and AI assistant:"}
              </p>
            </div>
          </div>
          <button
            onClick={closeLanguageModal}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid of Languages */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition text-left group ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-600/20"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {lang.nativeName}
                  </p>
                  <p className="text-xs text-slate-500">{lang.name}</p>
                </div>
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-slate-300 group-hover:border-blue-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={closeLanguageModal}
            className="px-6 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition"
          >
            {t("common.continue") || "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectorModal;
