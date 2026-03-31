import { notFound } from "next/navigation";

interface PolicyPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { handle } = await params;
  
  const dummyPolicies: { [key: string]: { title: string, body: string } } = {
    'privacy-policy': { title: 'Privacy Policy', body: '<p>Your privacy is important to us. This policy describes how we collect and use your data.</p>' },
    'refund-policy': { title: 'Refund Policy', body: '<p>We offer a 30-day return policy for all unused items in their original packaging.</p>' },
    'shipping-policy': { title: 'Shipping Policy', body: '<p>We offer complimentary express shipping on all orders worldwide.</p>' },
    'terms-of-service': { title: 'Terms of Service', body: '<p>By using our website, you agree to these terms and conditions.</p>' }
  };

  const policy = dummyPolicies[handle];

  if (!policy) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-syne font-bold text-white mb-12 tracking-tight">
          {policy.title}
        </h1>
        <div 
          className="prose prose-invert prose-lg max-w-none font-inter text-gray-300 leading-relaxed
                     prose-headings:font-syne prose-headings:text-white prose-headings:mt-12 prose-headings:mb-6
                     prose-p:mb-6 prose-strong:text-white prose-a:text-white prose-a:underline underline-offset-4
                     hover:prose-a:text-gray-400 transition-colors"
          dangerouslySetInnerHTML={{ __html: policy.body }}
        />
      </div>
    </div>
  );
}
