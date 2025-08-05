import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaHome, 
  FaUserAlt, 
  FaHistory, 
  FaShoppingCart,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkerAlt,
  FaEnvelope,
  FaGlobe,
  FaPhone,
  FaShieldAlt,
  FaLock,
  FaMobileAlt,
  FaCreditCard,
  FaStore,
  FaTruck,
  FaInfoCircle,
  FaUserCheck,
  FaUtensils,
  FaMoneyBillWave,
  FaClock,
  FaUndo,
  FaUserShield,
  FaChartLine,
  FaBalanceScale,
  FaTrashAlt,
  FaChild,
  FaLink
} from 'react-icons/fa';

const TermsAndPrivacy = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const termsSections = [
    {
      id: 'eligibility',
      title: "1. Eligibility",
      content: "You must be at least 18 years old and a resident of India to use the Foodie Heaven platform. By using this app, you confirm that you meet these requirements.",
      icon: <FaUserCheck className="text-orange-500 mr-2" />
    },
    {
      id: 'user-account',
      title: "2. User Account",
      content: "To place orders through Foodie Heaven:\n\n• You must register using a valid mobile number and email address\n• You are responsible for maintaining the confidentiality of your account and OTPs\n• You agree to provide accurate and up-to-date information",
      icon: <FaUserAlt className="text-orange-500 mr-2" />
    },
    {
      id: 'service-overview',
      title: "3. Service Overview",
      content: "Foodie Heaven connects users with local restaurants and food vendors in Kolkata, West Bengal.\n\nOur services include:\n• Browsing local menus\n• Placing food orders\n• Assigning delivery partners for fulfillment\n\nWe do not prepare or package the food and are not responsible for its quality or contents.",
      icon: <FaUtensils className="text-orange-500 mr-2" />
    },
    {
      id: 'orders-payment',
      title: "4. Orders and Payment",
      content: "• Orders once confirmed cannot be modified or canceled unless the restaurant is unable to fulfill it\n• Prices are shown in Indian Rupees (INR) and include applicable GST\n• Payment options include UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery (where available)\n• Foodie Heaven may charge a nominal delivery or service fee",
      icon: <FaMoneyBillWave className="text-orange-500 mr-2" />
    },
    {
      id: 'delivery-timings',
      title: "5. Delivery and Timings",
      content: "• Delivery timelines are approximate and depend on location, traffic, and restaurant readiness\n• In case of significant delays or undelivered orders, please contact our support team immediately\n• Delivery is currently available within Kolkata and surrounding areas",
      icon: <FaTruck className="text-orange-500 mr-2" />
    },
    {
      id: 'cancellations-refunds',
      title: "6. Cancellations and Refunds",
      content: "Refunds are issued in the following cases:\n• Restaurant cancels the order\n• Order is not delivered\n• Wrong or damaged items delivered\n\nRefunds will be processed within 5–7 business days through the original payment method",
      icon: <FaUndo className="text-orange-500 mr-2" />
    },
    {
      id: 'user-responsibilities',
      title: "7. User Responsibilities",
      content: "Users agree to:\n• Behave respectfully with delivery personnel and restaurant staff\n• Not misuse the app for fraudulent or unlawful activities\n• Provide accurate delivery information and be available to receive the order",
      icon: <FaUserShield className="text-orange-500 mr-2" />
    },
    {
      id: 'restaurant-responsibility',
      title: "8. Restaurant/Vendor Responsibility",
      content: "Partner restaurants are responsible for:\n• Food preparation and hygiene\n• Packaging and order accuracy\n• Complying with FSSAI and other food safety norms\n\nFoodie Heaven is not liable for any issues arising from the food or preparation process",
      icon: <FaStore className="text-orange-500 mr-2" />
    },
    {
      id: 'intellectual-property',
      title: "9. Intellectual Property",
      content: "All content on the app—including logos, trademarks, text, images, and software—is owned or licensed by Transmogrify Global Pvt. Ltd.\n\nYou may not copy, distribute, or reuse this content without permission.",
      icon: <FaInfoCircle className="text-orange-500 mr-2" />
    },
    {
      id: 'privacy-policy',
      title: "10. Privacy Policy",
      content: "Please refer to our Privacy Policy (available in this app) to understand how we collect and use your personal data in accordance with Indian data protection laws.",
      icon: <FaShieldAlt className="text-orange-500 mr-2" />
    },
    {
      id: 'limitation-liability',
      title: "11. Limitation of Liability",
      content: "Foodie Heaven is not responsible for:\n• Any allergic reactions or health issues caused by food\n• Delays in delivery due to unforeseen events\n• Errors or service interruptions beyond our control\n\nUse of the app is at your own risk.",
      icon: <FaBalanceScale className="text-orange-500 mr-2" />
    },
    {
      id: 'termination',
      title: "12. Termination",
      content: "We reserve the right to suspend or terminate your account without prior notice if:\n• You violate these Terms\n• You engage in abuse, fraud, or misconduct\n• Your behavior threatens the safety of others",
      icon: <FaTrashAlt className="text-orange-500 mr-2" />
    },
    {
      id: 'changes-terms',
      title: "13. Changes to Terms",
      content: "We may update these Terms from time to time. You will be notified of changes via the app. Continued use of the service implies your acceptance of the updated terms.",
      icon: <FaChartLine className="text-orange-500 mr-2" />
    },
    {
      id: 'governing-law',
      title: "14. Governing Law and Jurisdiction",
      content: "These Terms are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts of Kolkata, West Bengal.",
      icon: <FaBalanceScale className="text-orange-500 mr-2" />
    }
  ];

  const privacySections = [
    {
      id: 'updates',
      title: "1. Updates to This Policy",
      content: "We may update this Privacy Policy from time to time. All changes will be posted on this page with the updated effective date. We encourage you to review it periodically.",
      icon: <FaChartLine className="text-orange-500 mr-2" />
    },
    {
      id: 'info-collect',
      title: "2. Information We Collect",
      content: "We may collect and process the following types of information:\n\na. Personal Information\n• Name\n• Phone number\n• Email address\n• Delivery address(es)\n• Profile picture (if uploaded)\n• Payment details (processed via third-party services)\n\nb. Order and Transaction Data\n• Items ordered\n• Order history\n• Transaction amounts and timestamps\n• Preferred restaurants or cuisines\n\nc. Location Information\nWe may collect real-time location data from your device:\n• To show nearby restaurants\n• To track deliveries in real-time\n• To calculate delivery charges accurately\n\nYou can manage your location permissions through your device settings.\n\nd. Automatically Collected Information\nWhen you use the app, we may automatically collect:\n• Device type and OS version\n• IP address\n• App usage logs\n• Crash reports\n• Referral source (if you arrived from an ad or link)",
      icon: <FaMobileAlt className="text-orange-500 mr-2" />
    },
    {
      id: 'info-use',
      title: "3. How We Use Your Information",
      content: "We use your data to:\n• Process orders and facilitate deliveries\n• Provide customer support\n• Offer personalized restaurant and dish suggestions\n• Improve app performance and user experience\n• Send order updates, promotional messages, or surveys\n• Prevent fraud or abuse\n• Comply with legal obligations",
      icon: <FaTruck className="text-orange-500 mr-2" />
    },
    {
      id: 'info-sharing',
      title: "4. Sharing of Information",
      content: "We do not sell your personal information. However, we may share your data with:\n\na. Delivery Partners\nYour name, contact details, and delivery address may be shared with assigned delivery partners for order fulfilment.\n\nb. Restaurant Partners\nOrder details and delivery info may be shared with restaurants preparing your food.\n\nc. Service Providers\nWe may use third-party vendors for:\n• Payment processing (e.g., Razorpay, PhonePe, etc.)\n• Analytics (e.g., Google Analytics)\n• SMS and email notifications\n• Marketing tools\n\nd. Legal Requirements\nWe may disclose your data to government agencies or legal bodies if required by law or to protect our rights or users' safety.\n\ne. Business Transfers\nIn the event of a merger, acquisition, or sale, your data may be transferred to the new entity.",
      icon: <FaCreditCard className="text-orange-500 mr-2" />
    },
    {
      id: 'data-retention',
      title: "5. Data Retention",
      content: "We retain your information for as long as necessary to:\n• Fulfill the purposes outlined in this policy\n• Comply with legal obligations\n• Resolve disputes and enforce our agreements\n\nYou may request deletion of your data at any time.",
      icon: <FaClock className="text-orange-500 mr-2" />
    },
    {
      id: 'security',
      title: "6. Security of Your Information",
      content: "We implement appropriate technical and organizational measures to protect your data. However, no method of transmission or storage is 100% secure.",
      icon: <FaLock className="text-orange-500 mr-2" />
    },
    {
      id: 'your-rights',
      title: "7. Your Rights and Choices",
      content: "a. Access and Update\nYou can view or edit your personal data from the Profile or Account Settings section in the app.\n\nb. Opt-Out Options\nYou can opt-out of:\n• Promotional communications via app/email/SMS\n• Location tracking by disabling it in your device settings\n\nc. Account Deletion\nYou may request to delete your account by contacting our support team. We will process such requests in compliance with applicable law.",
      icon: <FaUserShield className="text-orange-500 mr-2" />
    },
    {
      id: 'children',
      title: "8. Policy for Children",
      content: "Foodie Heaven is not intended for users under the age of 13. We do not knowingly collect data from children. If we become aware that we have collected data from a minor, we will delete it immediately.",
      icon: <FaChild className="text-orange-500 mr-2" />
    },
    {
      id: 'third-party',
      title: "9. Third-Party Links",
      content: "Our app may contain links to third-party websites or services (e.g., restaurant websites, payment gateways). We are not responsible for the privacy practices of such third parties.",
      icon: <FaLink className="text-orange-500 mr-2" />
    }
  ];

  const contactInfo = [
    { icon: <FaEnvelope className="text-orange-500" />, text: "📧 tgwbin@gmail.com" },
    { 
      icon: <FaMapMarkerAlt className="text-orange-500" />, 
      text: "Mani Casadona, Unit- 10ES06, 11F, 04, Street Number 372, Action Area IIF, New Town, West Bengal 700156",
      subtext: "Landmark: Opposite Eco space business park" 
    },
    { icon: <FaGlobe className="text-orange-500" />, text: "https://transmogrifyglobal.com" },
    { icon: <FaPhone className="text-orange-500" />, text: "033-46015366" }
  ];

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-xl">
            <FaArrowLeft />
          </button>
          <div className="flex items-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
              alt="Logo" 
              className="w-6 h-6 mr-2"
            />
            <h1 className="text-lg font-bold">Terms & Privacy</h1>
          </div>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-orange-200 bg-white sticky top-14 z-20">
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex-1 py-3 font-medium text-sm ${activeTab === 'terms' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
        >
          Terms & Conditions
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-3 font-medium text-sm ${activeTab === 'privacy' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
        >
          Privacy Policy
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Company Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 mb-4">
          <div className="flex items-center mb-2">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
              alt="Logo" 
              className="w-10 h-10 mr-3"
            />
            <div>
              <h2 className="font-bold text-gray-900">Foodie Heaven</h2>
              <p className="text-xs text-gray-600">by Transmogrify Global Pvt. Ltd.</p>
              <p className="text-xs text-gray-500 mt-1">Kolkata, West Bengal, India</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            {activeTab === 'terms' 
              ? "By using our app, you agree to our Terms & Conditions." 
              : "We respect your privacy and protect your personal information."}
          </p>
        </div>

        {/* Dynamic Content */}
        {activeTab === 'terms' ? (
          <>
            {termsSections.map((section) => (
              <div key={section.id} className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 mb-3">
                <button
                  onClick={() => toggleSection(`terms-${section.id}`)}
                  className="w-full flex justify-between items-center"
                >
                  <div className="flex items-center">
                    {section.icon}
                    <h3 className="font-bold text-gray-900 text-left">{section.title}</h3>
                  </div>
                  {expandedSections[`terms-${section.id}`] ? (
                    <FaChevronUp className="text-orange-500" />
                  ) : (
                    <FaChevronDown className="text-orange-500" />
                  )}
                </button>
                {expandedSections[`terms-${section.id}`] && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{section.content}</p>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <FaShieldAlt className="text-orange-500 mr-2" />
                Your Privacy Matters
              </h2>
              <p className="text-sm text-gray-700">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our Foodie Heaven app.
              </p>
            </div>

            {privacySections.map((section) => (
              <div key={section.id} className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 mb-3">
                <button
                  onClick={() => toggleSection(`privacy-${section.id}`)}
                  className="w-full flex justify-between items-center"
                >
                  <div className="flex items-center">
                    {section.icon}
                    <h3 className="font-bold text-gray-900 text-left">{section.title}</h3>
                  </div>
                  {expandedSections[`privacy-${section.id}`] ? (
                    <FaChevronUp className="text-orange-500" />
                  ) : (
                    <FaChevronDown className="text-orange-500" />
                  )}
                </button>
                {expandedSections[`privacy-${section.id}`] && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{section.content}</p>
                )}
              </div>
            ))}

            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <FaUserAlt className="text-orange-500 mr-2" />
                Contact Our Privacy Team
              </h3>
              <div className="space-y-3">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <span className="mt-1 mr-3">{item.icon}</span>
                    <div>
                      <p className="text-sm text-gray-700">{item.text}</p>
                      {item.subtext && <p className="text-xs text-gray-500 mt-1">{item.subtext}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 flex justify-around items-center p-3 z-20">
          <button 
            onClick={() => navigate('/home')}
            className="text-gray-500 flex flex-col items-center"
          >
            <FaHome className="text-lg" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            onClick={() => navigate('/history')}
            className="text-gray-500 flex flex-col items-center"
          >
            <FaHistory className="text-lg" />
            <span className="text-xs mt-1">Orders</span>
          </button>
          <button 
            onClick={() => navigate('/cart')}
            className="text-orange-500 flex flex-col items-center"
          >
            <FaShoppingCart className="text-lg" />
            <span className="text-xs mt-1">Cart</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="text-gray-500 flex flex-col items-center"
          >
            <FaUserAlt className="text-lg" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;