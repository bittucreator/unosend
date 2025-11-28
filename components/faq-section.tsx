'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: "How does the free plan work?",
    answer: "You get 5,000 emails and 1,500 contacts per month for free, forever. No credit card required. Perfect for side projects and startups getting started with email."
  },
  {
    question: "What are the paid plan limits?",
    answer: "Pro plan ($20/mo) includes 50,000 emails and 10,000 contacts. Scale plan ($100/mo) includes 200,000 emails and 25,000 contacts. Indian users get 50% off on all paid plans!"
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes! You can verify your custom domains and send from any address. We guide you through DKIM, SPF, and DMARC setup for maximum deliverability."
  },
  {
    question: "How do I integrate the API?",
    answer: "Simply grab your API key from the dashboard, and make a POST request to our /v1/emails endpoint. Check our docs for code examples in Node.js, Python, Go, Ruby, and more."
  },
  {
    question: "What's included in each plan?",
    answer: "All plans include API access, email tracking, and webhooks. Pro adds advanced analytics and priority support. Scale includes unlimited domains and team members."
  },
  {
    question: "Do you offer regional pricing?",
    answer: "Yes! Users in India automatically get 50% off on Pro ($10/mo) and Scale ($50/mo) plans. The discount is applied automatically at checkout."
  },
]

export function FAQSection() {
  return (
    <div className="max-w-2xl mx-auto">
      <Accordion type="single" collapsible className="w-full space-y-3">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`} 
            className="bg-white border border-stone-200/60 rounded-xl px-5 data-[state=open]:ring-1 data-[state=open]:ring-stone-200"
          >
            <AccordionTrigger className="text-[14px] font-semibold text-left hover:no-underline py-4 text-stone-900">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

