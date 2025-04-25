import { Facebook, Twitter, Linkedin, Shield, FileText, AlertCircle, HelpCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Consumer Resources */}
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-4">
              Consumer Protection
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="https://www.ftc.gov" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  Federal Trade Commission
                </a>
              </li>
              <li>
                <a href="https://www.consumerfinance.gov" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  Consumer Financial Protection
                </a>
              </li>
              <li>
                <a href="https://www.identitytheft.gov" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Identity Theft Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-4">
              File Complaints
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900 inline-flex items-center justify-center">
                  CFPB Complaints
                </a>
              </li>
              <li>
                <a href="https://www.usa.gov/consumer-complaints" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900 inline-flex items-center justify-center">
                  General Complaints
                </a>
              </li>
              <li>
                <a href="https://www.usa.gov/online-purchase-complaints" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900 inline-flex items-center justify-center">
                  Online Purchase Issues
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/#pricing" className="text-base text-gray-500 hover:text-gray-900 inline-flex items-center justify-center">
                  Pricing
                </a>
              </li>
              <li>
                <a href="mailto:info@disputeai.xyz" className="text-base text-gray-500 hover:text-gray-900 inline-flex items-center justify-center">
                  Contact
                </a>
              </li>
              <li>
                <a href="https://www.usa.gov" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  USA.gov Resources
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mt-8">
          <a href="https://www.facebook.com/mhemediainc/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Facebook</span>
            <Facebook className="h-6 w-6" />
          </a>
          <a href="https://x.com/disputeai_ai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-6 w-6" />
          </a>
          <a href="https://www.linkedin.com/in/coinvestinno/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">LinkedIn</span>
            <Linkedin className="h-6 w-6" />
          </a>
        </div>

        {/* Copyright and Disclaimer */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-base text-gray-400">
            © {new Date().getFullYear()} ConsumerAI. All rights reserved.
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            ConsumerAI provides information about consumer protection laws but is not a substitute for professional legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
