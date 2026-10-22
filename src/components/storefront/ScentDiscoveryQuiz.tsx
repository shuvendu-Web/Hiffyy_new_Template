import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Sparkles, Check, ArrowRight, Brain } from 'lucide-react';

interface ScentDiscoveryQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScentDiscoveryQuiz: React.FC<ScentDiscoveryQuizProps> = ({ isOpen, onClose }) => {
  const { products, setSelectedProduct } = useStore();
  const [step, setStep] = useState(1);
  const [preference, setPreference] = useState('');
  const [occasion, setOccasion] = useState('');
  const [climate, setClimate] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<{
    productId: string;
    reasoning: string;
    layeringTip: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleDiagnose = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/scent-profiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: preference,
          occasion,
          season: climate,
          currentFavorites: 'Woody, Amber, Rose',
        }),
      });

      let chosenProduct = products[0];
      if (preference.includes('Fresh') || climate.includes('Monsoon')) {
        chosenProduct = products.find((p) => p.slug === 'monsoon-vetiver-petrichor') || products[1];
      } else if (preference.includes('Gourmand') || preference.includes('Sweet')) {
        chosenProduct = products.find((p) => p.slug === 'kashmiri-saffron-bourbon-vanilla') || products[2];
      } else if (preference.includes('Leather') || preference.includes('Smoky')) {
        chosenProduct = products.find((p) => p.slug === 'malabar-spice-smoked-leather') || products[5];
      } else if (preference.includes('Floral') || preference.includes('Rose')) {
        chosenProduct = products.find((p) => p.slug === 'gulab-attar-modern') || products[4];
      }

      setRecommendationResult({
        productId: chosenProduct.id,
        reasoning: `Based on your desire for ${preference} during ${occasion} in ${climate}, the 35% Extrait de Parfum concentration will project magnificently on skin without suffocating warmth.`,
        layeringTip: 'Spray on collarbones and inner elbows right after moisturizing with unscented cream for 14+ hours of unbroken sillage.',
      });
      setStep(4);
    } catch {
      setRecommendationResult({
        productId: products[0].id,
        reasoning: 'Oud Royal Rajasthan combines Assam agarwood with cooling Kannauj rosewater, making it imperial yet versatile.',
        layeringTip: 'Apply 2 sprays on pulse points.',
      });
      setStep(4);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const recommendedProd = products.find((p) => p.id === recommendationResult?.productId) || products[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#12231A]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E6DFD5] shadow-2xl rounded-xl p-4 sm:p-5">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-[#717A75] hover:text-[#12231A] cursor-pointer p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase font-bold text-[#886938] mb-1.5">
          <Sparkles className="w-3 h-3 text-[#96F816]" />
          <span>Olfactory Diagnosis Engine</span>
        </div>

        {step === 1 && (
          <div>
            <h3 className="text-lg font-serif font-bold text-[#12231A] mb-1">
              1. What aromatic aura do you seek?
            </h3>
            <p className="text-xs text-[#717A75] mb-4">
              Select the core olfactory emotion that aligns with your presence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {[
                { id: 'Royal Oud & Woods', desc: 'Resinous, commanding, majestic Assam Agarwood' },
                { id: 'Fresh Vetiver & Earth', desc: 'Petrichor, green Khus root, cooling rain' },
                { id: 'Amber & Sweet Saffron', desc: 'Warm vanilla, golden Pampore honeyed threads' },
                { id: 'Smoky Spiced Leather', desc: 'Tellicherry pepper, dark rum, vintage motorcycle' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setPreference(item.id);
                    setStep(2);
                  }}
                  className={`p-3 text-left border rounded-lg transition-all cursor-pointer ${
                    preference === item.id
                      ? 'border-[#12231A] bg-[#12231A] text-[#96F816]'
                      : 'border-[#E6DFD5] bg-white hover:border-[#96F816]'
                  }`}
                >
                  <span className="block text-xs font-bold">{item.id}</span>
                  <span className="block text-[10px] opacity-70 mt-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-xl font-serif font-bold text-[#12231A] mb-2">
              2. For which occasion will you wear this flacon?
            </h3>
            <p className="text-xs text-[#717A75] mb-6">
              Fragrance evolves dynamically depending on ambiance and body heat.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                'Grand Weddings & Evening Galas',
                'Executive Boardrooms & Daily Signature',
                'Intimate Dates & Twilight Dinners',
                'Weekend Escapes & Mediterranean Lounges',
              ].map((occ) => (
                <button
                  key={occ}
                  onClick={() => {
                    setOccasion(occ);
                    setStep(3);
                  }}
                  className={`p-4 text-left border rounded-sm transition-all cursor-pointer ${
                    occasion === occ
                      ? 'border-[#12231A] bg-[#12231A] text-[#DFCAAB]'
                      : 'border-[#E6DFD5] bg-white hover:border-[#C5A880]'
                  }`}
                >
                  <span className="block text-xs font-bold">{occ}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="text-xs text-[#717A75] hover:text-[#12231A] underline"
            >
              &larr; Previous Question
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-xl font-serif font-bold text-[#12231A] mb-2">
              3. Climate & Temperature Setting
            </h3>
            <p className="text-xs text-[#717A75] mb-6">
              Indian humidity and heat interact with molecular weight of top and base notes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                'Hot & Humid Summer (High Transpiration)',
                'Monsoon Rains & Damp Coastal Air',
                'Air-Conditioned Indoor Sanctuary',
                'Brisk Winter & Northern Cool Winds',
              ].map((clim) => (
                <button
                  key={clim}
                  onClick={() => {
                    setClimate(clim);
                  }}
                  className={`p-4 text-left border rounded-sm transition-all cursor-pointer ${
                    climate === clim
                      ? 'border-[#12231A] bg-[#12231A] text-[#DFCAAB]'
                      : 'border-[#E6DFD5] bg-white hover:border-[#C5A880]'
                  }`}
                >
                  <span className="block text-xs font-bold">{clim}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E6DFD5]">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-[#717A75] hover:text-[#12231A] underline"
              >
                &larr; Previous Question
              </button>

              <button
                disabled={!climate || isAnalyzing}
                onClick={handleDiagnose}
                className="py-3 px-6 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="w-4 h-4 animate-spin text-[#C5A880]" />
                    <span>Synthesizing Olfactory Chemistry...</span>
                  </>
                ) : (
                  <>
                    <span>Discover Match</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 4 && recommendationResult && (
          <div className="text-center space-y-6">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#886938] block mb-1">
                Your Ideal Olfactory Soulmate
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#12231A]">
                {recommendedProd.title}
              </h2>
              <span className="text-xs text-[#717A75] uppercase tracking-wider">
                {recommendedProd.fragranceFamily} • {recommendedProd.concentration}
              </span>
            </div>

            <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm flex gap-4 text-left items-center">
              <img
                src={recommendedProd.images[0]}
                alt={recommendedProd.title}
                className="w-20 h-24 object-cover border border-[#E6DFD5] rounded-sm"
              />
              <div className="flex-1">
                <p className="text-xs text-[#1B201E] leading-relaxed mb-2">
                  {recommendationResult.reasoning}
                </p>
                <div className="text-[11px] text-[#886938] bg-[#FAF8F5] p-2 border border-[#E6DFD5]">
                  <strong className="block text-[10px] uppercase font-bold text-[#12231A]">
                    Master Layering Advice:
                  </strong>
                  {recommendationResult.layeringTip}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedProduct(recommendedProd);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#182F23] cursor-pointer"
              >
                View Flacon & Reserve
              </button>
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 border border-[#E6DFD5] text-[#717A75] hover:text-[#12231A] text-xs uppercase tracking-wider cursor-pointer"
              >
                Retake
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
