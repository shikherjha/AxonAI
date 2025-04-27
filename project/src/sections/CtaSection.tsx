import React from 'react';

const CtaSection: React.FC = () => {
  return (
    <section className="py-16 bg-primary-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and educators who are already benefiting from AxonAI's powerful educational tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-primary-600 rounded-md font-medium hover:bg-gray-100 transition-colors shadow-md">
              Sign Up for Free
            </button>
            <button className="px-8 py-3 border border-white text-white rounded-md font-medium hover:bg-primary-500 transition-colors">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;