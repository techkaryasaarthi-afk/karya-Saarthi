// Karya Saarthi Chatbot - Hum Hai Aapke Saarthi
(function() {
    // Chat knowledge base
    const botName = 'Saarthi';
    const botAvatar = 'KS';
    const whatsappNumber = '918595275753';
    const whatsappLink = 'https://wa.me/918595275753?text=Hi%20Karya%20Saarthi!%20I%20need%20help.';
    const phoneNumber = '+91 85952 75753';
    const email = 'hr@karyasaarthi.com';
    const chatSessionId = 'ks_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const chatHistory = []; // track conversation for WhatsApp

    // FAQ data - keyword matching
    const faqs = [
        {
            keywords: ['hi','hello','hey','hii','hiii','namaste','helo','good morning','good evening','good afternoon'],
            response: `Hello! Welcome to <strong>Karya Saarthi</strong>! 🙏\n\nHum Hai Aapke Saarthi! How can I help you today?\n\nYou can ask me about:\n• Our Services\n• Career Opportunities\n• How to Apply\n• Contact Info\n• Pricing`
        },
        {
            keywords: ['service','services','what do you do','kya karte','what you do','offerings','offer'],
            response: `We offer a wide range of services:\n\n<strong>📚 For Students:</strong>\n• Research Paper Writing\n• Thesis & Dissertation Help\n• Assignment Assistance\n• MBA/BTech Projects\n• Data Analysis (SPSS)\n\n<strong>💻 For Businesses:</strong>\n• Website Development\n• Mobile App Development\n• Graphic & Logo Design\n• Digital Marketing & SEO\n• Social Media Marketing\n\nWant details on any specific service?`
        },
        {
            keywords: ['career','job','jobs','vacancy','vacancies','opening','openings','hiring','hire','work with you','join','recruitment'],
            response: `We're always looking for talented people! 🚀\n\nCurrent opportunities:\n• <strong>Vendors</strong> - Web Dev, Design, Writing\n• <strong>Interns</strong> - Marketing, Content, Tech\n• <strong>Campus Saarthi</strong> - College Ambassadors\n• <strong>Employees</strong> - Full-time roles\n\n<a href="/careers.php" style="color:#2563eb;font-weight:bold;">👉 View All Openings</a>\n<a href="/register.php" style="color:#ea580c;font-weight:bold;">👉 Apply Now</a>`
        },
        {
            keywords: ['apply','application','how to apply','register','sign up','signup','join kaise','kaise apply'],
            response: `Applying is easy! Just 4 steps:\n\n<strong>1.</strong> Browse openings at <a href="/careers.php" style="color:#2563eb;">Careers Page</a>\n<strong>2.</strong> Click on a position you like\n<strong>3.</strong> Fill the application form & upload resume\n<strong>4.</strong> Submit! We'll review & contact you.\n\n<a href="/register.php" style="color:#ea580c;font-weight:bold;">👉 Apply Now</a>\n\nYou'll receive email updates at every stage!`
        },
        {
            keywords: ['contact','phone','number','call','reach','email','mail','whatsapp','address','location'],
            response: `You can reach us through:\n\n📞 <strong>Phone:</strong>\n• <a href="tel:+918595275753" style="color:#2563eb;">+91 85952 75753</a>\n• <a href="tel:+916238521530" style="color:#2563eb;">+91 62385 21530</a>\n\n📧 <strong>Email:</strong> <a href="mailto:${email}" style="color:#2563eb;">${email}</a>\n\n💬 <strong>WhatsApp:</strong> <a href="${whatsappLink}" style="color:#25d366;font-weight:bold;" target="_blank">Chat Now</a>\n\n🌐 <strong>Website:</strong> www.karyasaarthi.com\n\n⏰ Mon-Sat, 9 AM - 6 PM`
        },
        {
            keywords: ['price','pricing','cost','charge','fee','fees','kitna','rate','rates','budget','affordable','cheap','expensive'],
            response: `Our pricing is <strong>affordable & transparent</strong>! 💰\n\nPricing depends on:\n• Type of project\n• Complexity & scope\n• Deadline\n\n✅ No hidden charges\n✅ Pay when satisfied\n✅ Student-friendly rates\n✅ Free revisions included\n\nGet a <strong>FREE quote</strong> - just tell us your requirement!\n\n<a href="${whatsappLink}" style="color:#25d366;font-weight:bold;" target="_blank">💬 Get Quote on WhatsApp</a>`
        },
        {
            keywords: ['thesis','research paper','research','paper','dissertation','synopsis','literature review'],
            response: `We provide expert <strong>Academic Writing</strong> services:\n\n📝 Research Paper Writing\n📝 Thesis & Dissertation (PhD, MTech, MBA)\n📝 Synopsis & Proposal Writing\n📝 Literature Review\n📝 Data Analysis (SPSS, Excel)\n📝 Plagiarism Check & Removal\n\n✅ 100% Original Content\n✅ Zero Plagiarism Guarantee\n✅ All Subjects Covered\n✅ Proper Citations (APA, MLA, Harvard)\n\n<a href="${whatsappLink}" style="color:#25d366;font-weight:bold;" target="_blank">💬 Discuss Your Paper</a>`
        },
        {
            keywords: ['website','web','app','application','develop','development','developer','wordpress','ecommerce'],
            response: `We build amazing <strong>Websites & Apps</strong>! 💻\n\n🌐 <strong>Websites:</strong>\n• Business Websites\n• E-commerce Stores\n• WordPress Sites\n• Portfolio Sites\n• Landing Pages\n\n📱 <strong>Apps:</strong>\n• Android Apps\n• iOS Apps\n• Cross-platform Apps\n\n✅ Mobile Responsive\n✅ SEO Friendly\n✅ Fast & Secure\n✅ Free SSL & Hosting (select plans)\n\n<a href="${whatsappLink}" style="color:#25d366;font-weight:bold;" target="_blank">💬 Get Free Quote</a>`
        },
        {
            keywords: ['design','logo','graphic','graphics','banner','poster','branding','ui','ux'],
            response: `Our <strong>Design Services</strong>: 🎨\n\n• Logo Design\n• Brand Identity\n• Social Media Graphics\n• Posters & Banners\n• Business Cards\n• UI/UX Design\n• Presentation Design\n• Video Editing\n\n✅ Creative & Professional\n✅ Multiple Concepts\n✅ All File Formats\n\n<a href="${whatsappLink}" style="color:#25d366;font-weight:bold;" target="_blank">💬 Discuss Design</a>`
        },
        {
            keywords: ['marketing','digital marketing','seo','social media','ads','google ads','promotion','promote'],
            response: `<strong>Digital Marketing</strong> Services: 📈\n\n• SEO (Search Engine Optimization)\n• Social Media Marketing\n• Google Ads & PPC\n• Content Marketing\n• Email Marketing\n• Brand Promotion\n\n✅ Affordable Plans\n✅ Measurable Results\n✅ Expert Team\n\n<a href="${whatsappLink}" style="color:#25d366;font-weight:bold;" target="_blank">💬 Get Marketing Plan</a>`
        },
        {
            keywords: ['campus saarthi','campus','ambassador','college','student','earn while study','earn money','part time'],
            response: `<strong>Campus Saarthi Program</strong>! 🎓\n\nBecome a Campus Ambassador & earn!\n\n✅ Earn <strong>10% commission</strong> on every project\n✅ Work from your college\n✅ Flexible hours\n✅ Build leadership skills\n✅ Certificate & experience\n\nPerfect for college students!\n\n<a href="/campus-saarthi.php" style="color:#2563eb;font-weight:bold;">👉 Learn More</a>\n<a href="/register.php" style="color:#ea580c;font-weight:bold;">👉 Join Now</a>`
        },
        {
            keywords: ['intern','internship','training','learn','certificate','fresher'],
            response: `<strong>Internship Opportunities</strong>! 📋\n\nWe offer internships in:\n• Content Writing\n• Digital Marketing\n• Web Development\n• Graphic Design\n• Social Media Management\n\n✅ Work from home\n✅ Stipend provided\n✅ Certificate on completion\n✅ Real project experience\n✅ Letter of Recommendation\n\n<a href="/careers.php?category=intern" style="color:#2563eb;font-weight:bold;">👉 View Internships</a>`
        },
        {
            keywords: ['plagiarism','copy','original','unique','copied'],
            response: `<strong>100% Plagiarism Free!</strong> ✅\n\nAll our work is:\n• Written from scratch\n• Checked with advanced tools\n• Plagiarism report provided\n• Unlimited revisions if needed\n\nWe guarantee <strong>zero plagiarism</strong>. Your academic integrity is our priority!`
        },
        {
            keywords: ['time','delivery','deadline','how long','when','days','urgent','fast','quick'],
            response: `<strong>Delivery Timeline:</strong> ⏰\n\nDepends on project type:\n• Research Paper: 3-7 days\n• Thesis Chapter: 5-10 days\n• Website: 7-15 days\n• App: 15-30 days\n• Logo: 2-3 days\n\n✅ Urgent delivery available!\n✅ On-time guarantee\n\nTell us your deadline - we'll make it work!\n\n<a href="${whatsappLink}" style="color:#25d366;font-weight:bold;" target="_blank">💬 Share Deadline</a>`
        },
        {
            keywords: ['payment','pay','upi','bank','money','transaction','refund'],
            response: `<strong>Payment Options:</strong> 💳\n\n• UPI (Google Pay, PhonePe, Paytm)\n• Bank Transfer (NEFT/IMPS)\n• Online Payment\n\n✅ Pay when satisfied\n✅ Partial advance, rest on delivery\n✅ Transparent - no hidden charges\n✅ Invoice provided\n\nContact us for payment details.`
        },
        {
            keywords: ['about','who are you','kya hai','karya saarthi','company','tell me about'],
            response: `<strong>About Karya Saarthi</strong> 🤝\n\nKarya = Work | Saarthi = Companion\n<em>"Your Work Companion"</em>\n\nWe help students & businesses with projects:\n\n📊 <strong>500+</strong> Projects Completed\n⭐ <strong>98%</strong> Customer Satisfaction\n🎓 Students from top colleges\n🏢 Businesses across India\n\nOur motto: <strong>Hum Hai Aapke Saarthi!</strong>\n\nWe don't just do your work - we teach you too!`
        },
        {
            keywords: ['teaching expert','teacher','trainer','professor','teach','faculty','instructor','expert trainer','phd','live project','guide','mentor','tutor'],
            response: `<strong>Teaching Expert Program</strong>! 🎓\n\nBecome a KS Verified Expert Trainer!\n\n<strong>Who can apply:</strong>\n• Professors & PhD Scholars\n• Industry experts with 5+ years\n• CA, CFA, or certified professionals\n\n<strong>What you get:</strong>\n✅ Per-session honorarium + bonus\n✅ Public profile with Verified badge\n✅ Flexible teaching schedule\n✅ Revenue share for top trainers\n\n<strong>Domains:</strong> Research, Tech, Business, Marketing, Legal, Finance, Design & more\n\n<a href="/careers.php?category=teaching_expert" style="color:#2563eb;font-weight:bold;">👉 View Teaching Expert Roles</a>\n<a href="/register.php" style="color:#ea580c;font-weight:bold;">👉 Apply Now</a>`
        },
        {
            keywords: ['life at ks','culture','values','team','work culture','office','events','perks','benefits'],
            response: `<strong>Life at Karya Saarthi</strong> 🏢\n\nOur 5 core values: Teach, Trust, Team, Transform, Thrive!\n\n✅ Work from home options\n✅ Flexible hours\n✅ Real project experience\n✅ Certificates & LOR\n✅ Performance-based growth\n✅ Team events & celebrations\n\n<a href="/life-at-ks.php" style="color:#2563eb;font-weight:bold;">👉 Explore Life at KS</a>`
        },
        {
            keywords: ['complaint','anonymous','secret','report','harassment','issue','problem','grievance'],
            response: `We take complaints seriously! 🔒\n\nUse our <strong>Secret Complaint Box</strong>:\n✅ 100% anonymous — no name, no IP logged\n✅ HR reviews within 7 working days\n✅ Categories: Workplace, Harassment, Policy, Management\n\nLogin to your dashboard → Complaint Box\n\nOr email: <a href="mailto:hr@karyasaarthi.com" style="color:#2563eb;">hr@karyasaarthi.com</a>`
        },
        {
            keywords: ['leaderboard','rank','badge','gamification','points','reward','top performer'],
            response: `<strong>Leaderboard & Badges</strong> 🏆\n\nWe recognize top performers every month!\n\n🥇 <strong>Gold</strong> — Top 3 performers\n🥈 <strong>Silver</strong> — Top 10\n🥉 <strong>Bronze</strong> — Top 25\n\nRanked by referrals, attendance & task completion.\n\nLogin to your dashboard to see your rank!`
        },
        {
            keywords: ['dark mode','dark','night mode','theme'],
            response: `<strong>Dark Mode</strong> 🌙\n\nYes! We support dark mode.\n\nLook for the moon/sun toggle button at the bottom-left of any page. Click it to switch between light and dark themes!\n\nYour preference is saved automatically.`
        },
        {
            keywords: ['thank','thanks','thankyou','thank you','dhanyavad','shukriya','bye','goodbye','ok','okay'],
            response: `You're welcome! 😊\n\nRemember, <strong>Hum Hai Aapke Saarthi!</strong>\n\nFeel free to ask anytime. We're here for you!\n\n<a href="${whatsappLink}" style="color:#25d366;font-weight:bold;" target="_blank">💬 WhatsApp Us</a>\n📞 Call: ${phoneNumber}`
        },
        {
            keywords: ['human','real person','talk to someone','agent','support','help','customer care','complaint','whatsapp'],
            response: `I'll connect you with our team! 🙋\n\n<a href="javascript:sendChatToWhatsApp()" style="color:#25d366;font-weight:bold;font-size:16px;">💬 Send This Chat to WhatsApp</a>\n(Your full conversation will be forwarded)\n\n📞 Call: <a href="tel:+918595275753" style="color:#2563eb;">${phoneNumber}</a>\n📧 Email: <a href="mailto:${email}" style="color:#2563eb;">${email}</a>\n\nOur team responds within <strong>1 hour</strong> during working hours (Mon-Sat, 9AM-6PM).`
        }
    ];

    // Quick reply buttons
    const quickReplies = [
        { text: '📋 Services', value: 'services' },
        { text: '💼 Careers', value: 'career openings' },
        { text: '📞 Contact', value: 'contact' },
        { text: '💰 Pricing', value: 'pricing' },
        { text: '💬 WhatsApp', value: 'whatsapp_send', isWhatsApp: true }
    ];

    // Find best matching FAQ
    function findAnswer(input) {
        const lower = input.toLowerCase().trim();
        let bestMatch = null;
        let bestScore = 0;

        for (const faq of faqs) {
            let score = 0;
            for (const kw of faq.keywords) {
                if (lower === kw) { score += 10; }
                else if (lower.includes(kw)) { score += 5; }
                else {
                    const words = lower.split(/\s+/);
                    for (const w of words) {
                        if (kw.includes(w) && w.length > 2) score += 2;
                    }
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = faq;
            }
        }

        if (bestScore >= 2 && bestMatch) {
            return bestMatch.response;
        }

        return `I'm not sure about that, but I'd love to help! 😊\n\nYou can:\n• Try asking differently\n• Use the quick buttons below\n• <a href="${whatsappLink}" style="color:#25d366;font-weight:bold;" target="_blank">💬 Chat with our team on WhatsApp</a>\n• Call us: <a href="tel:+918595275753" style="color:#2563eb;">${phoneNumber}</a>`;
    }

    // Create chatbot HTML
    function createChatbot() {
        const html = `
        <!-- Chat Toggle Button (always visible) -->
        <div id="ks-chat-toggle" onclick="toggleChat()" style="position:fixed;bottom:24px;right:24px;z-index:99999;cursor:pointer;">
            <div style="width:64px;height:64px;background:linear-gradient(135deg,#2563eb,#f97316);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 25px rgba(37,99,235,0.5);transition:transform 0.3s,box-shadow 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div id="ks-badge" style="position:absolute;top:-2px;right:-2px;width:22px;height:22px;background:#ef4444;border-radius:50%;color:#fff;font-size:11px;font-weight:bold;display:flex;align-items:center;justify-content:center;border:2px solid #fff;animation:ks-bounce 2s infinite;">1</div>
        </div>

        <!-- Chat Window (hidden by default) -->
        <div id="ks-chat-window" style="display:none;position:fixed;bottom:24px;right:24px;z-index:99999;width:370px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 100px);background:#fff;border-radius:20px;box-shadow:0 10px 50px rgba(0,0,0,0.25);overflow:hidden;flex-direction:column;font-family:Arial,sans-serif;">
            <div id="ks-chatbot" style="display:flex;flex-direction:column;height:100%;">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#1e40af,#2563eb,#f97316);padding:18px 20px;display:flex;align-items:center;justify-content:space-between;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:42px;height:42px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;font-size:14px;backdrop-filter:blur(5px);">${botAvatar}</div>
                        <div>
                            <div style="color:#fff;font-weight:bold;font-size:15px;">${botName} - Karya Saarthi</div>
                            <div style="color:#fdba74;font-size:11px;display:flex;align-items:center;gap:4px;">
                                <span style="width:7px;height:7px;background:#4ade80;border-radius:50%;display:inline-block;"></span> Online | Hum Hai Aapke Saarthi
                            </div>
                        </div>
                    </div>
                    <button onclick="toggleChat()" style="background:none;border:none;color:rgba(255,255,255,0.8);font-size:20px;cursor:pointer;padding:5px;">✕</button>
                </div>

                <!-- Messages Area -->
                <div id="ks-messages" style="flex:1;overflow-y:auto;padding:16px;background:#f1f5f9;display:flex;flex-direction:column;gap:12px;"></div>

                <!-- Quick Replies -->
                <div id="ks-quick-replies" style="padding:8px 12px;background:#fff;border-top:1px solid #e5e7eb;display:flex;gap:6px;overflow-x:auto;flex-shrink:0;">
                    ${quickReplies.map(q => {
                        if (q.isWhatsApp) {
                            return `<button onclick="sendQuick('${q.value}')" style="flex-shrink:0;padding:6px 12px;border-radius:20px;border:1px solid #25d366;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.2s;" onmouseover="this.style.background='#25d366';this.style.color='#fff'" onmouseout="this.style.background='#dcfce7';this.style.color='#16a34a'">${q.text}</button>`;
                        }
                        return `<button onclick="sendQuick('${q.value}')" style="flex-shrink:0;padding:6px 12px;border-radius:20px;border:1px solid #2563eb;background:#eff6ff;color:#2563eb;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.2s;" onmouseover="this.style.background='#2563eb';this.style.color='#fff'" onmouseout="this.style.background='#eff6ff';this.style.color='#2563eb'">${q.text}</button>`;
                    }).join('')}
                </div>

                <!-- Input Area -->
                <div style="padding:12px;background:#fff;border-top:1px solid #e5e7eb;display:flex;gap:8px;flex-shrink:0;">
                    <input type="text" id="ks-chat-input" placeholder="Type your message..."
                        style="flex:1;padding:10px 16px;border:2px solid #e5e7eb;border-radius:25px;font-size:14px;outline:none;transition:border 0.2s;"
                        onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e5e7eb'"
                        onkeydown="if(event.key==='Enter')sendMessage()">
                    <button onclick="sendMessage()" style="width:42px;height:42px;background:linear-gradient(135deg,#2563eb,#f97316);border:none;border-radius:50%;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                    </button>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', html);

        // Make chat window flex
        document.getElementById('ks-chat-window').style.display = 'none';
        document.getElementById('ks-chat-window').style.flexDirection = 'column';

    }

    // Add bot message
    function addBotMessage(text, typing = true) {
        const container = document.getElementById('ks-messages');

        if (typing) {
            // Show typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.id = 'ks-typing';
            typingDiv.innerHTML = `<div style="display:flex;align-items:flex-end;gap:8px;">
                <div style="width:30px;height:30px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:bold;flex-shrink:0;">${botAvatar}</div>
                <div style="background:#fff;padding:12px 16px;border-radius:16px 16px 16px 4px;box-shadow:0 1px 3px rgba(0,0,0,0.08);font-size:14px;">
                    <div style="display:flex;gap:4px;"><span style="width:8px;height:8px;background:#94a3b8;border-radius:50%;animation:ks-bounce 1.2s infinite;"></span><span style="width:8px;height:8px;background:#94a3b8;border-radius:50%;animation:ks-bounce 1.2s 0.2s infinite;"></span><span style="width:8px;height:8px;background:#94a3b8;border-radius:50%;animation:ks-bounce 1.2s 0.4s infinite;"></span></div>
                </div>
            </div>`;
            container.appendChild(typingDiv);
            container.scrollTop = container.scrollHeight;

            setTimeout(() => {
                typingDiv.remove();
                appendBotMsg(container, text);
            }, 800 + Math.random() * 600);
        } else {
            appendBotMsg(container, text);
        }
    }

    function appendBotMsg(container, text) {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:flex-end;gap:8px;animation:ks-fadeIn 0.3s ease;';
        div.innerHTML = `
            <div style="width:30px;height:30px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:bold;flex-shrink:0;">${botAvatar}</div>
            <div style="background:#fff;padding:12px 16px;border-radius:16px 16px 16px 4px;box-shadow:0 1px 3px rgba(0,0,0,0.08);max-width:85%;font-size:13px;line-height:1.6;color:#374151;white-space:pre-line;">${text}</div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;

        // Track & log bot response
        const plainText = text.replace(/<[^>]*>/g, '').substring(0, 200);
        chatHistory.push({ sender: 'bot', text: plainText, time: new Date().toLocaleTimeString() });
        logToServer(plainText, 'bot');
    }

    // Add user message
    function addUserMessage(text) {
        const container = document.getElementById('ks-messages');
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;justify-content:flex-end;animation:ks-fadeIn 0.3s ease;';
        div.innerHTML = `<div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:10px 16px;border-radius:16px 16px 4px 16px;max-width:80%;font-size:13px;line-height:1.5;box-shadow:0 1px 3px rgba(37,99,235,0.2);">${escapeHtml(text)}</div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;

        // Track & log
        chatHistory.push({ sender: 'user', text: text, time: new Date().toLocaleTimeString() });
        logToServer(text, 'user');
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    // Log message to server database
    function logToServer(message, sender) {
        try {
            const body = new URLSearchParams({
                action: 'log',
                session_id: chatSessionId,
                message: message.replace(/<[^>]*>/g, ''), // strip HTML
                sender: sender,
                page_url: window.location.href
            });
            fetch('/api/chatbot.php', { method: 'POST', body: body }).catch(() => {});
        } catch(e) {}
    }

    // Build WhatsApp message from chat history
    function buildWhatsAppChat() {
        let msg = '🤖 *Chat from Karya Saarthi Website*\n';
        msg += '📅 ' + new Date().toLocaleDateString('en-IN') + '\n';
        msg += '🌐 Page: ' + window.location.href + '\n\n';
        msg += '--- Chat History ---\n\n';

        chatHistory.forEach(m => {
            if (m.sender === 'user') {
                msg += '👤 Visitor: ' + m.text + '\n';
            } else {
                msg += '🤖 Bot: ' + m.text.substring(0, 100) + '...\n';
            }
        });

        msg += '\n--- End ---\n';
        msg += 'Please continue this conversation.';
        return msg;
    }

    // Send chat to WhatsApp
    window.sendChatToWhatsApp = function() {
        const msg = buildWhatsAppChat();
        const url = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(msg);
        window.open(url, '_blank');
    };

    // Toggle chat
    window.toggleChat = function() {
        const win = document.getElementById('ks-chat-window');
        const toggle = document.getElementById('ks-chat-toggle');
        const badge = document.getElementById('ks-badge');

        if (win.style.display === 'none' || win.style.display === '') {
            win.style.display = 'flex';
            toggle.style.display = 'none';
            if (badge) badge.style.display = 'none';

            // First open - show welcome
            if (document.getElementById('ks-messages').children.length === 0) {
                addBotMessage(faqs[0].response, false);
            }

            // Focus input
            setTimeout(() => { document.getElementById('ks-chat-input').focus(); }, 300);
        } else {
            win.style.display = 'none';
            toggle.style.display = 'block';
        }
    };

    // Send message
    window.sendMessage = function() {
        const input = document.getElementById('ks-chat-input');
        const text = input.value.trim();
        if (!text) return;

        addUserMessage(text);
        input.value = '';

        const answer = findAnswer(text);
        addBotMessage(answer);
    };

    // Quick reply
    window.sendQuick = function(value) {
        if (value === 'whatsapp_send') {
            addUserMessage('Send chat to WhatsApp');
            addBotMessage('Opening WhatsApp with your chat history... 💬\n\nYour complete conversation will be sent to our team!', false);
            setTimeout(() => { sendChatToWhatsApp(); }, 500);
            return;
        }
        addUserMessage(value);
        const answer = findAnswer(value);
        addBotMessage(answer);
    };

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ks-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes ks-fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        #ks-messages::-webkit-scrollbar { width:5px; }
        #ks-messages::-webkit-scrollbar-track { background:#f1f5f9; }
        #ks-messages::-webkit-scrollbar-thumb { background:#cbd5e1;border-radius:10px; }
        #ks-quick-replies::-webkit-scrollbar { height:0; }
    `;
    document.head.appendChild(style);

    // Init on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatbot);
    } else {
        createChatbot();
    }

    // Auto-show after 5 seconds on first visit
    setTimeout(() => {
        if (!sessionStorage.getItem('ks-chat-shown')) {
            const badge = document.getElementById('ks-badge');
            if (badge) badge.style.animation = 'ks-bounce 1s infinite';
            sessionStorage.setItem('ks-chat-shown', '1');
        }
    }, 5000);
})();
