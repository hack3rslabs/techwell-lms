import React from "react";
import { Card } from "@/components/ui/card";

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-primary border-b pb-4">Terms and Conditions</h1>
      
      <Card className="p-8 bg-muted/30 shadow-inner">
        <div className="text-xs text-muted-foreground leading-relaxed text-justify space-y-6 font-medium font-serif opacity-90 tracking-tight">
          
          <section>
            <h2 className="text-sm font-bold text-foreground mb-2 uppercase tracking-widest border-b border-border/50 pb-1">1. General Terms & Introduction</h2>
            <p>
              By accessing, browsing, or utilizing the services provided by Techwell IT Solutions ("Techwell", "We", "Us", or "Our"), you (the "User", "Client", "Candidate", or "Customer") irrevocably agree to be bound by these comprehensive Terms and Conditions. These terms constitute a legally binding agreement governing your use of all Techwell services, platforms, and products. If you do not unequivocally agree to these terms, you are expressly prohibited from utilizing any of our services and must immediately discontinue access. Techwell reserves the right, at its sole and absolute discretion, to modify, amend, alter, or replace these Terms and Conditions at any time without prior notice. Continued use of our services subsequent to any such modifications shall constitute your explicit consent to such changes. It is your inherent responsibility to review these terms periodically for any alterations. These terms supersede any prior agreements, representations, or understandings, whether written or oral, between you and Techwell. All intellectual property rights, including but not limited to copyrights, trademarks, trade secrets, and patents related to the services provided, are the exclusive property of Techwell. Unauthorized use, reproduction, or distribution of our proprietary materials is strictly prohibited and subject to severe legal prosecution.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-foreground mb-2 uppercase tracking-widest border-b border-border/50 pb-1">2. Software Solutions & IT Services</h2>
            <p>
              Techwell provides bespoke Software Development, IT Solutions, Web Development, and Enterprise Application services. All deliverables are provided strictly on an "as-is" basis, subject to the specifications agreed upon in the respective Statement of Work (SOW) or Service Level Agreement (SLA). Techwell explicitly disclaims any implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We shall not be held liable for any indirect, incidental, consequential, special, or punitive damages arising from the use or inability to use our software solutions, including but not limited to data loss, business interruption, or loss of profits. Project timelines and delivery schedules are estimates and subject to change due to unforeseen technical complexities or delayed client feedback. The Client bears full responsibility for providing timely approvals, necessary assets, and system access required for project completion. Failure to provide such requisites may result in project suspension and additional billing. Upon final delivery and full clearance of outstanding invoices, a limited non-exclusive license for the use of the developed software is granted to the Client, while Techwell retains full underlying copyright and code ownership unless explicitly transferred in writing.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-foreground mb-2 uppercase tracking-widest border-b border-border/50 pb-1">3. Cyber Security Services</h2>
            <p>
              Our Cyber Security consulting, auditing, penetration testing, and vulnerability assessment services are executed with the utmost professional diligence using industry-standard methodologies. However, due to the rapidly evolving nature of cyber threats, Techwell does not guarantee, warrant, or represent that its services will identify all possible vulnerabilities, nor that the client's systems will remain entirely secure from current or future cyber-attacks, unauthorized access, data breaches, or malicious exploitation. The Client explicitly agrees to indemnify and hold Techwell harmless from any legal liabilities, financial losses, regulatory fines, or reputational damage resulting from a cyber incident, irrespective of whether Techwell previously audited or secured the affected systems. All penetration testing is conducted strictly within the authorized scope; the Client assumes full responsibility for any inadvertent system downtime, data corruption, or operational disruption that may occur during the testing process. The findings presented in our security reports are confidential and meant exclusively for internal remediation by the Client.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-foreground mb-2 uppercase tracking-widest border-b border-border/50 pb-1">4. Digital Marketing Services</h2>
            <p>
              Techwell provides comprehensive Digital Marketing Services, including but not limited to Search Engine Optimization (SEO), Social Media Management (SMM), Pay-Per-Click (PPC) Advertising, Content Marketing, and Digital Strategy formulation. The Client acknowledges that search engine algorithms, social media platform policies, and digital advertising costs are entirely controlled by third-party entities (e.g., Google, Meta, LinkedIn) and are subject to constant, unannounced changes. Consequently, Techwell explicitly disclaims any guarantee regarding specific search engine rankings, lead generation volumes, conversion rates, exact cost-per-click metrics, or instantaneous Return on Investment (ROI). While Techwell executes campaigns utilizing proven industry best practices, the Client assumes all inherent risks associated with digital marketing expenditures. The Client is solely responsible for ensuring that all products, services, and claims promoted through Techwell's campaigns comply with local, national, and international advertising laws and regulations. Techwell shall not be held liable for any ad account suspensions, domain penalties, or shadow-banning imposed by third-party platforms. All advertising budgets are payable directly to the respective ad networks unless managed via a specific escrow arrangement.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-foreground mb-2 uppercase tracking-widest border-b border-border/50 pb-1">5. Training, Courses & Placements</h2>
            <p>
              Techwell offers rigorous Corporate Training, Skill Development Courses, and Educational Bootcamps. Enrollment in any of our training programs is strictly voluntary. We make no guarantees, warranties, or representations regarding the candidate's subsequent employability, salary increments, or career progression upon completion of the course. The curriculum is subject to dynamic modifications to align with current industry trends. Candidates are expected to maintain professional decorum, strict attendance, and academic integrity throughout the duration of the training. Any form of intellectual property theft, unauthorized sharing of course materials, or disruptive behavior will result in immediate expulsion without refund. Placement assistance, where offered, is solely a facilitative service providing interview opportunities; Techwell operates strictly as a liaison and is NOT the ultimate employer. The final hiring decision rests exclusively with the prospective hiring entity. Techwell is not responsible for any rescinded offers, delayed onboarding, changes in CTC, or post-joining workplace disputes. Candidates availing placement consultancy agree to attend all scheduled interviews promptly and conduct themselves professionally.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-foreground mb-2 uppercase tracking-widest border-b border-border/50 pb-1">6. Strict Refund & Cancellation Policy</h2>
            <p>
              ALL PAYMENTS, FEES, RETAINERS, AND DEPOSITS MADE TO TECHWELL FOR ANY SERVICE—INCLUDING BUT NOT LIMITED TO SOFTWARE DEVELOPMENT, IT SOLUTIONS, CYBER SECURITY, DIGITAL MARKETING, TRAINING, AND PLACEMENT CONSULTANCY—ARE STRICTLY, CATEGORICALLY, AND ABSOLUTELY NON-REFUNDABLE UNDER ANY CIRCUMSTANCES. By remitting payment to Techwell, the Client/User acknowledges the substantial upfront investment of time, resources, infrastructure, and intellectual capital deployed by Techwell upon the commencement of an engagement. In the event of a project cancellation, premature termination, mid-training drop-out, failure to secure a job placement, dissatisfaction with digital marketing metrics, or any other reason initiated by the Client/User, no pro-rated refunds, chargebacks, or credit notes will be issued. Techwell vigorously disputes all unauthorized credit card chargebacks and reserves the right to pursue aggressive legal action, including engaging collection agencies and filing civil lawsuits, to recover disputed amounts, alongside all associated legal and administrative costs. This no-refund policy is an essential, non-negotiable cornerstone of this agreement and is designed to legally protect Techwell from financial exposure following the mobilization of its specialized workforce and proprietary resources.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-foreground mb-2 uppercase tracking-widest border-b border-border/50 pb-1">7. Limitation of Liability & Governing Law</h2>
            <p>
              To the absolute maximum extent permitted by applicable law, Techwell, its directors, officers, employees, agents, affiliates, and contractors shall not be held liable for any direct, indirect, incidental, consequential, exemplary, punitive, or special damages of any kind whatsoever arising out of or in connection with the use, inability to use, or performance of our services. This includes damages for loss of profits, goodwill, use, data, or other intangible losses, even if Techwell has been advised of the possibility of such damages. The total aggregate liability of Techwell for any claim arising out of these terms shall in no event exceed the total amount paid by the Client/User to Techwell for the specific service in dispute during the three (3) months preceding the claim. These Terms and Conditions, and any disputes arising directly or indirectly hereunder, shall be governed exclusively by the laws of India. Any legal action, suit, or proceeding must be instituted exclusively in the competent courts located in Srikakulam, Andhra Pradesh, India. The Client/User explicitly waives any objection to the jurisdiction and venue of such courts. Techwell reserves the right to seek injunctive relief or any other equitable remedy in any court of competent jurisdiction to prevent the breach or threatened breach of its intellectual property or confidentiality rights.
            </p>
          </section>

        </div>
      </Card>
    </div>
  );
}
