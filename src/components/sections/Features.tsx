import { FiMic, FiGlobe, FiLock, FiZap, FiCode, FiHeadphones } from 'react-icons/fi';

const features = [
  {
    icon: <FiMic className="w-8 h-8" />,
    title: "Accurate Transcription",
    description: "Convert speech to text with industry-leading accuracy across multiple languages and accents.",
  },
  {
    icon: <FiGlobe className="w-8 h-8" />,
    title: "Multi-language Support",
    description: "Transcribe and translate between 50+ languages with a single click.",
  },
  {
    icon: <FiZap className="w-8 h-8" />,
    title: "Real-time Processing",
    description: "Get instant results with our lightning-fast AI processing engine.",
  },
  {
    icon: <FiLock className="w-8 h-8" />,
    title: "Secure & Private",
    description: "Your data is encrypted in transit and at rest. We never share your content.",
  },
  {
    icon: <FiCode className="w-8 h-8" />,
    title: "Developer Friendly",
    description: "Powerful API and SDKs for seamless integration into your workflow.",
  },
  {
    icon: <FiHeadphones className="w-8 h-8" />,
    title: "Speaker Diarization",
    description: "Automatically identify and separate different speakers in your recordings.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for All Your Audio Needs
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to transform your audio content into actionable insights.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            And much more, including custom vocabulary, timestamps, and export options.
          </p>
          <a 
            href="#pricing" 
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            See Pricing Plans
          </a>
        </div>
      </div>
    </section>
  );
}
