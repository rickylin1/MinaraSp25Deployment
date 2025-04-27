"use client"; 

import { Button } from '@/components/ui/button';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter(); 

  const handleExit = () => {
    router.push('/calendar'); 
  };
  
  return (
    <>
      <Head>
        <title>Privacy Policy for Minara - FreePrivacyPolicy.com</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />

        <meta property="og:title" content="Privacy Policy for Minara - FreePrivacyPolicy.com" />
        <meta property="og:image" content="https://www.freeprivacypolicy.com/public/images/meta_og_image_livelink.png" />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="720" />
        <meta property="og:url" content="https://www.freeprivacypolicy.com/live/1aeec1e5-6193-4264-a3af-353ee76bf7c2" />
        <meta property="og:site_name" content="FreePrivacyPolicy.com" />

        <link rel="canonical" href="https://www.freeprivacypolicy.com/live/1aeec1e5-6193-4264-a3af-353ee76bf7c2" />
      </Head>

      <main className="min-h-screen px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy for Minara</h1>
            <p className="text-sm text-gray-500">Last updated: April 20, 2025</p>
          </header>

          <section className="prose prose-lg text-justify">
            <h2><b>Privacy Policy</b></h2>
            <p>
              This Privacy Policy describes Our policies and procedures on the collection, use and
              disclosure of Your information when You use the Service and tells You about Your privacy
              rights and how the law protects You.
            </p>
            <p className="mt-2">
              We use Your Personal data to provide and improve the Service. By using the Service, You
              agree to the collection and use of information in accordance with this Privacy Policy.
              This Privacy Policy has been created with the help of the{' '}
              <a
                href="https://www.freeprivacypolicy.com/free-privacy-policy-generator/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Free Privacy Policy Generator
              </a>
              .
            </p>
            <p className="mb-4"></p>
            <h2><b>Interpretation and Definitions</b></h2>
            <h3><u>Interpretation</u></h3>
            <p>
              The words of which the initial letter is capitalized have meanings defined under the
              following conditions. The following definitions shall have the same meaning regardless
              of whether they appear in singular or in plural.
            </p>
            <p className="mb-2"></p>
            <h3><u>Definitions</u></h3>
            <p>For the purposes of this Privacy Policy:</p>
            <ul className="list-disc ml-6">
              <li><strong>Account</strong>: a unique account created for You to access our Service.</li>
              <li><strong>Company</strong>: refers to Minara.</li>
              <li><strong>Cookies</strong>: small files placed on Your device containing browsing history and preferences.</li>
              <li><strong>Country</strong>: Illinois, United States.</li>
              <li><strong>Device</strong>: any device used to access the Service.</li>
              <li><strong>Personal Data</strong>: information relating to an identifiable person.</li>
              <li><strong>Service</strong>: refers to the Website.</li>
              <li><strong>Service Provider</strong>: third-party entities processing data on behalf of the Company.</li>
              <li><strong>Third-party Social Media Service</strong>: social networks enabling login to our Service.</li>
              <li><strong>Usage Data</strong>: data collected automatically from usage of the Service.</li>
              <li><strong>Website</strong>: Minara, accessible from <a href="https://www.minara.app/calendar" className="text-blue-600 underline">https://www.minara.app/calendar</a></li>
              <li><strong>You</strong>: the individual accessing the Service.</li>
            </ul>

            <p className="mt-6 text-sm">
              For full details, please see the full privacy policy at{' '}
              <a
                href="https://www.freeprivacypolicy.com/live/1aeec1e5-6193-4264-a3af-353ee76bf7c2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                this link
              </a>
              .
            </p>
          </section>

          <footer className="mt-8 border-t pt-4 text-sm text-gray-500">
            <p>
              Generated using{' '}
              <a
                href="https://www.freeprivacypolicy.com/free-privacy-policy-generator/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600"
              >
                Free Privacy Policy Generator
              </a>
            </p>
          </footer>
        </div>
      </main>

      {/* Exit Button */}
      <div className="absolute top-8 right-12 flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={handleExit}>
          <span className="font-bold">X</span>
        </Button>
      </div>
    </>
  );
}
