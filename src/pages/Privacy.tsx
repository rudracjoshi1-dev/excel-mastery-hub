import { Layout } from "@/components/layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto prose prose-gray">
          <h1>Privacy Policy</h1>
          <p className="lead">Last updated: January 2026</p>
          
          <h2>Information We Collect</h2>
          <p>We collect information you provide directly, including when you contact us or use our interactive lessons.</p>
          
          <h2>How We Use Information</h2>
          <p>We use collected information to provide and improve our educational content, respond to inquiries, and analyse site usage.</p>
          
          <h2>Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to enhance your experience. Third-party services like Google Analytics and Google AdSense may also use cookies.</p>
          
          <h2>Third-Party Services</h2>
          <p>We may use third-party services including Google Analytics for site analytics and Google AdSense for advertising. These services have their own privacy policies.</p>
          
          <h2>Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
          
          <h2>Contact</h2>
          <p>For privacy-related questions, contact us at hello@excelmastery.com</p>
        </div>
      </div>
    </Layout>
  );
}
