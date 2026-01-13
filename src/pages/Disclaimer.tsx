import { Layout } from "@/components/layout";

export default function Disclaimer() {
  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto prose prose-gray">
          <h1>Disclaimer</h1>
          <p className="lead">Last updated: January 2026</p>
          
          <h2>Educational Content</h2>
          <p>The content on ExcelMastery is for educational purposes only. While we strive for accuracy, we make no warranties about the completeness or reliability of this information.</p>
          
          <h2>No Professional Advice</h2>
          <p>Our lessons and tutorials do not constitute professional advice. For specific business or professional needs, consult qualified experts.</p>
          
          <h2>Third-Party Links</h2>
          <p>Our site may contain links to external websites. We are not responsible for the content or privacy practices of these sites.</p>
          
          <h2>Trademarks</h2>
          <p>Microsoft Excel is a trademark of Microsoft Corporation. ExcelMastery is not affiliated with Microsoft.</p>
          
          <h2>Limitation of Liability</h2>
          <p>ExcelMastery shall not be liable for any damages arising from the use of this website or reliance on its content.</p>
        </div>
      </div>
    </Layout>
  );
}
