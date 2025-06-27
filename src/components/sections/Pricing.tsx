import { FiCheck, FiZap, FiAward, FiGlobe } from 'react-icons/fi';

const plans = [
  {
    name: "Starter",
    price: 0,
    period: "month",
    description: "Perfect for individuals getting started with audio transcription.",
    features: [
      "5 hours of transcription/month",
      "Basic support",
      "Export to TXT",
      "Up to 3 custom vocabularies",
      "Email support"
    ],
    featured: false,
    cta: "Get Started"
  },
  {
    name: "Professional",
    price: 29,
    period: "month",
    description: "For professionals who need more power and flexibility.",
    features: [
      "20 hours of transcription/month",
      "Priority support",
      "Export to TXT, SRT, VTT",
      "Up to 15 custom vocabularies",
      "Email & chat support",
      "API access (1,000 req/month)",
      "Bulk processing"
    ],
    featured: true,
    cta: "Start Free Trial"
  },
  {
    name: "Business",
    price: 99,
    period: "month",
    description: "For teams and businesses with higher volume needs.",
    features: [
      "100 hours of transcription/month",
      "24/7 priority support",
      "All export formats",
      "Unlimited custom vocabularies",
      "Dedicated account manager",
      "API access (10,000 req/month)",
      "Team collaboration",
      "Custom SLAs",
      "On-premises deployment"
    ],
    featured: false,
    cta: "Contact Sales"
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-2xl overflow-hidden border ${
                plan.featured 
                  ? 'border-2 border-blue-500 transform scale-105 shadow-xl' 
                  : 'border-gray-200 dark:border-gray-700 shadow-lg'
              } bg-white dark:bg-gray-800`}
            >
              {plan.featured && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <div className="flex items-center mb-2">
                  <h3 className="text-2xl font-bold dark:text-white">{plan.name}</h3>
                  {plan.name === "Starter" && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">Free</span>
                  )}
                </div>
                
                <div className="my-6">
                  <span className="text-4xl font-bold dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    /{plan.period}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {plan.description}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <FiCheck className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a
                  href={plan.name === "Business" ? "#contact" : "/signup"}
                  className={`block w-full text-center py-3 px-6 rounded-lg font-medium ${
                    plan.featured
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  } transition-colors`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl mx-auto border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 pr-8">
              <h3 className="text-2xl font-bold mb-3 dark:text-white">Need a custom solution?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We offer enterprise-grade solutions with custom pricing for organizations with specific requirements.
              </p>
              <a 
                href="#contact" 
                className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Contact our sales team
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="md:w-1/3 mt-6 md:mt-0 flex justify-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <FiAward className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                  Enterprise solutions with custom SLAs and support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
