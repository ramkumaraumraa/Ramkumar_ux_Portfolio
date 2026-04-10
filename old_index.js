const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Home-Dr5dYWNy.js","assets/react-vendors-BmFMMPF7.js","assets/three-vendors-BBA4jdbL.js","assets/animation-vendors-aLfjG8Xb.js","assets/Works-yb_-KwLj.js","assets/About-C5C7s5re.js","assets/Process-aRzxEqIp.js","assets/Footer-CeLRrIfw.js","assets/misc-vendors-BL-n8jwP.js"])))=>i.map(i=>d[i]);
var Z=Object.defineProperty;var Q=(r,a,n)=>a in r?Z(r,a,{enumerable:!0,configurable:!0,writable:!0,value:n}):r[a]=n;var G=(r,a,n)=>Q(r,typeof a!="symbol"?a+"":a,n);import{r as o,_ as W,R as e,u as ee,a as te,C as oe,P as ne,c as ae,B as se}from"./react-vendors-BmFMMPF7.js";import{g as L,S as q}from"./animation-vendors-aLfjG8Xb.js";import{e as re,L as ie}from"./misc-vendors-BL-n8jwP.js";import{l as U,g as Y,m as K,S as ce,P as le,W as me,n as ue,o as de,p as fe,N as pe,q as ge,A as he}from"./three-vendors-BBA4jdbL.js";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))l(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&l(c)}).observe(document,{childList:!0,subtree:!0});function n(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function l(t){if(t.ep)return;t.ep=!0;const i=n(t);fetch(t.href,i)}})();const ve=({onComplete:r})=>{const[a,n]=o.useState(0),[l,t]=o.useState(!1),[i,c]=o.useState(!1),[E,g]=o.useState(!1),[b,_]=o.useState(!1),[u,f]=o.useState(!1),h=o.useRef(null),R=o.useRef(!1);o.useEffect(()=>{_(window.innerWidth<=768)},[]),o.useEffect(()=>{if(!R.current){if(R.current=!0,window.dispatchEvent(new CustomEvent("loader-initializing")),!document.getElementById("nebula-bg")){const s=document.createElement("div");s.id="nebula-bg",s.style.opacity="0",document.body.insertBefore(s,document.body.firstChild)}A()}},[]);const A=async()=>{try{const s=await W(()=>import("./three-vendors-BBA4jdbL.js").then(F=>F.i),[]),d=document.createElement("canvas");d.width=256,d.height=256,d.style.cssText="position:fixed;top:-1000px;left:-1000px;",document.body.appendChild(d);const y=new s.WebGLRenderer({canvas:d,antialias:!1,alpha:!0,powerPreference:"high-performance"}),x=new s.Scene,N=new s.PerspectiveCamera(75,1,.1,1e3),k=new s.ShaderMaterial({vertexShader:`
          void main() {
            gl_Position = vec4(position, 1.0);
          }
        `,fragmentShader:`
          uniform float uTime;
          void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          }
        `,uniforms:{uTime:{value:0}}}),M=new s.PlaneGeometry(2,2),z=new s.Mesh(M,k);x.add(z),y.render(x,N),window.preloadedThreeJS={THREE:s,renderer:y,scene:x,camera:N},setTimeout(()=>{d.remove()},100),f(!0)}catch(s){console.warn("Three.js preload failed:",s),f(!0)}};o.useEffect(()=>{(async()=>{try{n(5),await new Promise(k=>setTimeout(k,300)),n(15),await new Promise(k=>{if(u)k();else{const M=()=>{u?k():setTimeout(M,100)};M()}}),n(35);const d=["/assets/imgs/icons/comets/Icon_brush.svg","/assets/imgs/icons/comets/Icon_paint.svg","/assets/imgs/icons/comets/Icon_pencil.svg","/assets/imgs/icons/comets/Icon_star.svg","/assets/imgs/icons/comets/Icon_bulb.svg"];let y=0;await Promise.all(d.map(k=>new Promise(M=>{const z=new Image;z.onload=()=>{y++;const F=35+y/d.length*20;n(D=>Math.max(D,F)),M()},z.onerror=M,z.src=k}))),n(60);const x=["/assets/imgs/Logo.svg","/assets/imgs/Cursor.svg","/assets/imgs/About/My Pic 1.png"];let N=0;await Promise.all(x.map(k=>new Promise(M=>{const z=new Image;z.onload=()=>{N++;const F=60+N/x.length*25;n(D=>Math.max(D,F)),M()},z.onerror=M,z.src=k}))),n(85),await new Promise(k=>setTimeout(k,400)),n(95),await new Promise(k=>setTimeout(k,200)),n(100)}catch(d){console.warn("Asset loading error:",d),n(100)}finally{t(!0)}})()},[u]),o.useEffect(()=>{if(!h.current)return;const s=b?90:120,d=2*Math.PI*s,y=d-a/100*d;h.current.style.strokeDashoffset=y},[a,b]),o.useEffect(()=>{a>=100&&l&&u&&!i&&setTimeout(()=>{c(!0),window.dispatchEvent(new CustomEvent("loader-exiting")),setTimeout(()=>{L.timeline().fromTo(".welcome-title",{opacity:0,y:40},{opacity:1,y:0,duration:1.2,ease:"power3.out"}).fromTo(".welcome-subtitle",{opacity:0,y:30},{opacity:1,y:0,duration:1,ease:"power3.out"},"-=0.6").fromTo(".enter-section",{opacity:0,scale:.8},{opacity:1,scale:1,duration:.8,ease:"back.out(1.5)"},"-=0.4")},100)},300)},[a,l,u,i]);const m=()=>{g(!0);const s=document.getElementById("nebula-bg");s&&(s.style.opacity="1",s.style.transition="opacity 0.6s ease"),window.dispatchEvent(new CustomEvent("background-can-start")),L.timeline({onComplete:()=>{setTimeout(()=>r==null?void 0:r(),100)}}).to(".loader-content",{scale:.9,opacity:0,duration:.6,ease:"power2.in"}).to(".loader",{opacity:0,duration:.8,ease:"power2.inOut"},"-=0.2")},w=b?220:280,v=b?110:140,I=b?90:120,P=2*Math.PI*I;return e.createElement("div",{className:`loader ${E?"fade-out":""}`},e.createElement("div",{className:"loader-content"},!i&&e.createElement("div",{className:"progress-container"},e.createElement("svg",{className:"progress-ring",width:w,height:w,viewBox:`0 0 ${w} ${w}`,style:{transform:"rotate(-90deg)"}},e.createElement("defs",null,e.createElement("linearGradient",{id:"progress-gradient",x1:"0%",y1:"0%",x2:"100%",y2:"100%"},e.createElement("stop",{offset:"0%",stopColor:"#00ffff"},e.createElement("animate",{attributeName:"stop-color",values:"#00ffff;#00a2ff;#b700ff;#00ffff",dur:"3s",repeatCount:"indefinite"})),e.createElement("stop",{offset:"50%",stopColor:"#00a2ff"},e.createElement("animate",{attributeName:"stop-color",values:"#00a2ff;#b700ff;#00ffff;#00a2ff",dur:"3s",repeatCount:"indefinite"})),e.createElement("stop",{offset:"100%",stopColor:"#b700ff"},e.createElement("animate",{attributeName:"stop-color",values:"#b700ff;#00ffff;#00a2ff;#b700ff",dur:"3s",repeatCount:"indefinite"}))),e.createElement("filter",{id:"glow"},e.createElement("feGaussianBlur",{stdDeviation:"3",result:"coloredBlur"}),e.createElement("feMerge",null,e.createElement("feMergeNode",{in:"coloredBlur"}),e.createElement("feMergeNode",{in:"SourceGraphic"})))),e.createElement("circle",{cx:v,cy:v,r:I,fill:"none",stroke:"rgba(255, 255, 255, 0.1)",strokeWidth:"2",className:"progress-bg"}),e.createElement("circle",{cx:v,cy:v,r:I,fill:"none",stroke:"rgba(0, 255, 255, 0.1)",strokeWidth:"1",opacity:"0.5"},e.createElement("animate",{attributeName:"r",values:`${I};${I+10};${I}`,dur:"2s",repeatCount:"indefinite"}),e.createElement("animate",{attributeName:"opacity",values:"0.5;0.1;0.5",dur:"2s",repeatCount:"indefinite"})),e.createElement("circle",{ref:h,cx:v,cy:v,r:I,fill:"none",stroke:"url(#progress-gradient)",strokeWidth:"4",strokeLinecap:"round",className:"progress-bar",filter:"url(#glow)",style:{strokeDasharray:P,strokeDashoffset:P,transition:"stroke-dashoffset 0.3s ease",transformOrigin:`${v}px ${v}px`}}),!b&&Array.from({length:12},(s,d)=>{const y=(d*30-90)*(Math.PI/180),x=I+15,N=v+Math.cos(y)*x,k=v+Math.sin(y)*x,M=d/12<=a/100;return e.createElement("circle",{key:d,cx:N,cy:k,r:"2",fill:M?"#00ffff":"rgba(255, 255, 255, 0.2)",opacity:M?"1":"0.3"},M&&e.createElement("animate",{attributeName:"r",values:"2;3;2",dur:"1s",repeatCount:"indefinite"}))})),e.createElement("div",{className:"progress-text"},e.createElement("h1",{className:"progress-number turquoise h1 neon"},Math.round(a),"%"),e.createElement("p",{className:"progress-label caption-text"},a<15?"Initializing WebGL...":a<35?"Loading Shaders...":a<60?"Preloading Assets...":a<85?"Preparing Background...":a<95?"Finalizing Setup...":"Ready to Launch"))),i&&e.createElement(e.Fragment,null,e.createElement("div",{className:"welcome-section"},e.createElement("h1",{className:"welcome-title blue h1 neon",style:{opacity:0}},"Welcome to Ramkumar's"),e.createElement("h3",{className:"welcome-subtitle turquoise h4 neon",style:{opacity:0}},"World of Design")),e.createElement("div",{className:"enter-section",style:{opacity:0}},e.createElement("button",{className:"enter-button",onClick:m},e.createElement("span",{className:"enter-text"},"Enter Journey"),e.createElement("span",{className:"enter-arrow"},"→"))))))},we=()=>{o.useEffect(()=>{const l=t=>{const i=document.getElementById("custom-cursor");i&&(i.style.left=`${t.clientX}px`,i.style.top=`${t.clientY}px`)};return document.addEventListener("mousemove",l),()=>{document.removeEventListener("mousemove",l)}},[]);class r{constructor(t,i,c){const{ctx:E,pointer:g,hue:b}=c;this.ctx=E,this.x=g.x,this.y=g.y,this.mx=g.mx*.1,this.my=g.my*.1,this.size=Math.random()+1,this.decay=.01,this.speed=i*.08,this.spread=t*this.speed,this.spreadX=(Math.random()-.5)*this.spread-this.mx,this.spreadY=(Math.random()-.5)*this.spread-this.my,this.color=`hsl(${b}deg 90% 60%)`}draw(){this.ctx.fillStyle=this.color,this.ctx.beginPath(),this.ctx.arc(this.x,this.y,this.size,0,Math.PI*2),this.ctx.fill()}collapse(){this.size-=this.decay}trail(){this.x+=this.spreadX*this.size,this.y+=this.spreadY*this.size}update(){this.draw(),this.trail(),this.collapse()}}const n=class n extends HTMLElement{static register(t="custom-cursor-twinkles"){"customElements"in window&&!customElements.get(t)&&customElements.define(t,this)}constructor(){super(),this.canvas=null,this.ctx=null,this.fps=60,this.msPerFrame=1e3/this.fps,this.timePrevious=null,this.twinkles=[],this.pointer={x:0,y:0,mx:0,my:0},this.hue=0}connectedCallback(){const t=document.createElement("canvas"),i=new CSSStyleSheet,c=this.attachShadow({mode:"open"});i.replaceSync(n.css),c.adoptedStyleSheets=[i],c.appendChild(t),this.canvas=c.querySelector("canvas"),this.ctx=this.canvas.getContext("2d"),this.setCanvasDimensions(),this.setupEvents(),this.timePrevious=performance.now(),this.animateTwinkles()}createTwinkles(t,{count:i,speed:c,spread:E}){this.setPointerValues(t);for(let g=0;g<i;g++)this.twinkles.push(new r(E,c,this))}setPointerValues(t){this.pointer.x=t.clientX,this.pointer.y=t.clientY,this.pointer.mx=t.movementX||0,this.pointer.my=t.movementY||0}setupEvents(){document.addEventListener("click",t=>{this.createTwinkles(t,{count:120,speed:Math.random()+1,spread:Math.random()+30})}),document.addEventListener("pointermove",t=>{this.createTwinkles(t,{count:20,speed:this.getPointerVelocity(t),spread:1})}),window.addEventListener("resize",()=>this.setCanvasDimensions())}getPointerVelocity(t){const i=t.movementX||0,c=t.movementY||0;return Math.floor(Math.sqrt(i*i+c*c))}handleTwinkles(){for(let t=this.twinkles.length-1;t>=0;t--)this.twinkles[t].update(),this.twinkles[t].size<=.1&&this.twinkles.splice(t,1)}setCanvasDimensions(){this.canvas&&(this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight)}animateTwinkles(){requestAnimationFrame(()=>this.animateTwinkles());const t=performance.now(),i=t-this.timePrevious;if(i<this.msPerFrame)return;const c=i%this.msPerFrame;this.timePrevious=t-c,this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.hue=this.hue>360?0:this.hue+=3,this.handleTwinkles()}};G(n,"css",`
      :host {
        display: grid;
        width: 100%;
        height: 100%;
        pointer-events: none;
        position: fixed;
        top: 0;
        left: 0;
      }
    `);let a=n;return o.useEffect(()=>{a.register()},[]),e.createElement(e.Fragment,null,e.createElement("style",{dangerouslySetInnerHTML:{__html:`
          /* Custom Cursor Styles */
          #custom-cursor {
            position: fixed;
            width: 24px;
            height: 24px;
            background-size: cover;
            background-image: url('/assets/imgs/Cursor.svg');
            background-repeat: no-repeat;
            background-position: center;
            transition: transform 0.05s ease-out;
            transform: translate(-50%, -50%);
            z-index: 100001;
            pointer-events: none;
          }

          /* Twinkles Container */
          custom-cursor-twinkles {
            display: block;
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 100000;
            pointer-events: none;
          }

          body, a, button {
            cursor: none; /* Hide default cursor */
          }

          /* Scale the cursor when hovering over clickable items */
          a:hover, button:hover, .case-study-card:hover, .card-button:hover {
            #custom-cursor {
              transform: translate(-50%, -50%) scale(1.5); /* Enlarge the cursor on hover */
            }
          }
        `}}),e.createElement("custom-cursor-twinkles",null),e.createElement("div",{id:"custom-cursor"}))},ye=({isOpen:r,onClose:a})=>{const[n,l]=o.useState({name:"",email:"",organization:"",assistance:"",message:""}),[t,i]=o.useState(!1),[c,E]=o.useState({});o.useEffect(()=>{const u=f=>{f.key==="Escape"&&r&&a()};return r&&(document.addEventListener("keydown",u),document.body.style.overflow="hidden"),()=>{document.removeEventListener("keydown",u),document.body.style.overflow="auto"}},[r,a]);const g=u=>{const{name:f,value:h}=u.target;l({...n,[f]:h}),c[f]&&E({...c,[f]:""})},b=()=>{const u={};return n.name.trim()||(u.name="Name is required"),n.email.trim()?/\S+@\S+\.\S+/.test(n.email)||(u.email="Please enter a valid email address"):u.email="Email is required",n.assistance.trim()||(u.assistance="Please let us know how we can assist you"),n.message.trim()?n.message.trim().length<10&&(u.message="Message should be at least 10 characters long"):u.message="Message is required",E(u),Object.keys(u).length===0},_=u=>{if(u.preventDefault(),!b())return;i(!0);const f={from_name:n.name,from_email:n.email,organization:n.organization||"N/A",assistance:n.assistance,message:n.message,to_name:"RamKumar"};re.send("ramkumargd01","template_cko2itt",f,"MUZvBPSGwQFoiwINK").then(h=>{console.log("Email sent successfully:",h.text),alert("🎉 Message sent successfully! I'll get back to you within 1-3 days."),l({name:"",email:"",organization:"",assistance:"",message:""}),a()}).catch(h=>{console.error("Error sending message:",h),alert("❌ Failed to send the message. Please try again or reach out directly via email.")}).finally(()=>i(!1))};return r?e.createElement(e.Fragment,null,e.createElement("div",{className:"form-backdrop",onClick:a,style:{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0, 14, 35, 0.85)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:1e4,display:"flex",justifyContent:"center",alignItems:"center",padding:"20px",boxSizing:"border-box",animation:"fadeIn 0.3s ease-out"}},e.createElement("div",{className:"case-study-card",onClick:u=>u.stopPropagation(),style:{width:"100%",maxWidth:"800px",height:"auto",maxHeight:"90vh",overflow:"auto",padding:"32px",position:"relative",animation:"slideUp 0.4s ease-out"}},e.createElement("button",{onClick:a,"aria-label":"Close form",style:{position:"absolute",top:"16px",right:"16px",background:"none",border:"none",color:"#fff",fontSize:"24px",cursor:"none",padding:"8px",borderRadius:"4px",transition:"background 0.3s ease",zIndex:1},onMouseEnter:u=>u.target.style.background="rgba(255, 255, 255, 0.1)",onMouseLeave:u=>u.target.style.background="none"},"✕"),e.createElement("div",{style:{marginTop:"16px"}},e.createElement("h5",{className:"turquoise h5 neon",style:{marginBottom:"8px",textAlign:"center"}},"Let's Create Something Great Together!"),e.createElement("p",{className:"body-2",style:{textAlign:"center",marginBottom:"32px",opacity:.9}},"Share your project details and I'll get back to you within 1-3 days"),e.createElement("form",{onSubmit:_,className:"contact-form"},e.createElement("div",{className:"input-row"},e.createElement("div",{className:"input-group"},e.createElement("label",{className:"sub-header-3"},"Your Name ",e.createElement("span",{style:{color:"#ff6666"}},"*")),e.createElement("input",{type:"text",name:"name",placeholder:"Enter your full name",value:n.name,onChange:g,required:!0,"aria-describedby":c.name?"name-error":void 0,style:{borderColor:c.name?"#ff6666":void 0}}),c.name&&e.createElement("span",{id:"name-error",className:"caption-text",style:{color:"#ff6666",marginTop:"4px",display:"block"}},c.name)),e.createElement("div",{className:"input-group"},e.createElement("label",{className:"sub-header-3"},"Best Email to Reach You ",e.createElement("span",{style:{color:"#ff6666"}},"*")),e.createElement("input",{type:"email",name:"email",placeholder:"your.email@example.com",value:n.email,onChange:g,required:!0,"aria-describedby":c.email?"email-error":void 0,style:{borderColor:c.email?"#ff6666":void 0}}),c.email&&e.createElement("span",{id:"email-error",className:"caption-text",style:{color:"#ff6666",marginTop:"4px",display:"block"}},c.email))),e.createElement("div",{className:"input-row"},e.createElement("div",{className:"input-group"},e.createElement("label",{className:"sub-header-3"},"Organization/Company Name (optional)"),e.createElement("input",{type:"text",name:"organization",placeholder:"Your company or organization",value:n.organization,onChange:g})),e.createElement("div",{className:"input-group"},e.createElement("label",{className:"sub-header-3"},"What can I assist you with? ",e.createElement("span",{style:{color:"#ff6666"}},"*")),e.createElement("input",{type:"text",name:"assistance",placeholder:"e.g., Web Design, SaaS Product, Mobile App, Brand Strategy",value:n.assistance,onChange:g,required:!0,"aria-describedby":c.assistance?"assistance-error":void 0,style:{borderColor:c.assistance?"#ff6666":void 0}}),c.assistance&&e.createElement("span",{id:"assistance-error",className:"caption-text",style:{color:"#ff6666",marginTop:"4px",display:"block"}},c.assistance))),e.createElement("div",{className:"input-group full-width"},e.createElement("label",{className:"sub-header-3"},"What's on your mind? ",e.createElement("span",{style:{color:"#ff6666"}},"*")),e.createElement("textarea",{name:"message",placeholder:"Share any details you think are important, project timeline, budget range, or simply say hi! (minimum 10 characters)",rows:"5",value:n.message,onChange:g,required:!0,"aria-describedby":c.message?"message-error":void 0,style:{borderColor:c.message?"#ff6666":void 0,minHeight:"120px"}}),c.message&&e.createElement("span",{id:"message-error",className:"caption-text",style:{color:"#ff6666",marginTop:"4px",display:"block"}},c.message)),e.createElement("div",{className:"input-row align-end"},e.createElement("p",{className:"response-time caption-text",style:{opacity:.8}},"📧 Response back time: 1-3 days"),e.createElement("button",{type:"submit",className:"card-button sub-header-3",disabled:t,style:{opacity:t?.7:1,cursor:t?"not-allowed":"none"}},t?"Sending...":"Send Message",e.createElement("span",null),e.createElement("span",null),e.createElement("span",null),e.createElement("span",null),e.createElement("span",null))))))),e.createElement("style",{jsx:!0},`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Form Styles from Original Design System */
        .contact-form {
          display: flex;
          flex-direction: column;
          max-width: 100%;
          gap: 24px;
          margin-top: 24px;
        }

        .input-row {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .input-row.align-end {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .input-group.full-width {
          flex-basis: 100%;
        }

        .contact-form label {
          color: #ffffff;
          margin-bottom: 4px;
          font-family: 'Nunito', sans-serif;
          font-size: 18px;
          line-height: 28px;
          font-weight: 600;
        }

        .contact-form input, 
        .contact-form textarea {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #f1f1f1;
          background-color: rgba(29, 24, 38, 0.2);
          backdrop-filter: blur(1px);
          color: #ffffff;
          outline: none;
          font-family: 'Nunito', sans-serif;
          font-size: 16px;
          line-height: 24px;
          transition: all 0.3s ease;
        }

        .contact-form input::placeholder, 
        .contact-form textarea::placeholder {
          color: #b3c4d5;
          opacity: 0.7;
        }

        .contact-form textarea {
          resize: none;
        }

        .contact-form input:focus,
        .contact-form textarea:focus {
          outline: 2px solid #00ffff;
          outline-offset: 2px;
          border-color: #00ffff;
          background-color: rgba(29, 24, 38, 0.4);
        }

        .response-time {
          color: #efefef;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          line-height: 20px;
          font-weight: 400;
        }

        /* Responsive Form Styles */
        @media (max-width: 768px) {
          .contact-form {
            width: 100%;
            max-width: 100%;
            padding: 0;
          }

          .input-row {
            flex-direction: column;
            gap: 16px;
            width: 100%;
          }

          .input-group {
            width: 100%;
          }

          .contact-form input, 
          .contact-form textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 8px;
            border-radius: 8px;
          }

          .contact-form label {
            font-size: 16px;
            margin-bottom: 4px;
            text-align: left;
            display: inline-block;
            width: 100%;
          }

          .response-time {
            font-size: 12px;
            margin-top: 8px;
            text-align: left;
          }

          .card-button {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
          }

          .input-row.align-end {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
        }

        @media (max-width: 480px) {
          .contact-form {
            padding: 0;
          }

          .input-row {
            gap: 12px;
          }

          .contact-form input, 
          .contact-form textarea {
            font-size: 14px;
            padding: 10px;
          }

          .contact-form label {
            font-size: 14px;
          }

          .card-button {
            font-size: 14px;
            padding: 8px;
          }
        }
      `)):null},Ee="/assets/imgs/Logo.svg",V="/assets/imgs/icons/Phone.svg",j="/assets/imgs/icons/Email.svg",$="/assets/imgs/icons/file_copy.svg";L.registerPlugin(q);const be=()=>{const[r,a]=o.useState(!1),[n,l]=o.useState(!1),[t,i]=o.useState(window.innerWidth<=1024),[c,E]=o.useState(!1),g=o.useRef(null),b=o.useRef(null),_=o.useRef(null),u=[{default:"/assets/imgs/icons/social icons/01_Icon_Instagram.svg",hover:"/assets/imgs/icons/social icons/01_Icon_clr_Instagram.svg",link:"https://www.instagram.com/ramkumargd01"},{default:"/assets/imgs/icons/social icons/02_Icon_Dribbble.svg",hover:"/assets/imgs/icons/social icons/02_Icon_clr_Dribbble.svg",link:"https://dribbble.com/Ramuxui6"},{default:"/assets/imgs/icons/social icons/03_Icon_Behance.svg",hover:"/assets/imgs/icons/social icons/03_Icon_clr_Behance.svg",link:"https://www.behance.net/ramkumar6g80e6"},{default:"/assets/imgs/icons/social icons/04_Icon_Linkedin.svg",hover:"/assets/imgs/icons/social icons/04_Icon_clr_Linkedin.svg",link:"https://www.linkedin.com/in/ramkumar6g/"},{default:"/assets/imgs/icons/social icons/05_Icon_ADPlist.svg",hover:"/assets/imgs/icons/social icons/05_Icon_clr_ADPlist.svg",link:"https://adplist.org/mentors/ramkumar-g"}];o.useEffect(()=>(b.current&&!t&&(_.current=L.to(b.current,{"--gradient-angle":"360deg",duration:4,ease:"none",repeat:-1})),()=>{_.current&&_.current.kill()}),[t]),o.useEffect(()=>{const s=document.querySelector(".navbar");s&&L.to(s,{scrollTrigger:{trigger:document.body,start:"top top",end:"+=200",scrub:!0},background:"rgba(0, 14, 35, 0.85)",backdropFilter:"blur(12px)",height:"56px"})},[]);const f=s=>{navigator.clipboard.writeText(s).then(()=>{const y=event.currentTarget.querySelector("img");y&&L.to(y,{scale:1.2,duration:.2,yoyo:!0,repeat:1,ease:"power1.out"}),h(`${s} copied to clipboard!`)})},h=s=>{const d=document.createElement("div");d.className="toast-notification",d.textContent=s,document.body.appendChild(d),L.fromTo(d,{y:100,opacity:0},{y:-20,opacity:1,duration:.5,ease:"power2.out",onComplete:()=>{L.to(d,{y:100,opacity:0,duration:.5,delay:2,ease:"power2.in",onComplete:()=>d.remove()})}})};o.useEffect(()=>{const s=d=>{g.current&&!g.current.contains(d.target)&&a(!1)};return document.addEventListener("mousedown",s),()=>document.removeEventListener("mousedown",s)},[]),o.useEffect(()=>{const s=()=>{const d=window.innerWidth<=1024;i(d),d||l(!1)};return window.addEventListener("resize",s),()=>window.removeEventListener("resize",s)},[]);const R=()=>{a(!r),r||L.fromTo(".dropdown-menu",{opacity:0,y:-20,scale:.95},{opacity:1,y:0,scale:1,duration:.3,ease:"power2.out"})},A=()=>{L.to(".dropdown-menu",{opacity:0,y:-20,scale:.95,duration:.3,ease:"power2.in",onComplete:()=>a(!1)})},m=()=>{l(!n),document.body.style.overflow=n?"auto":"hidden";const s=L.timeline();n?s.to("#mobile-menu",{x:"100%",opacity:0,duration:.5,ease:"power2.in"}):s.fromTo("#mobile-menu",{x:"100%",opacity:0},{x:"0%",opacity:1,duration:.5,ease:"power2.out"}).fromTo("#mobile-menu ul li",{opacity:0,x:30},{opacity:1,x:0,stagger:.1,ease:"power2.out"},"<")},w=s=>{s.preventDefault(),window.scrollTo({top:0,behavior:"smooth"})},v=()=>{E(!0),a(!1),n&&m()},I=()=>{E(!1)},P=()=>{window.open("/assets/imgs/About/Ramkumarux_Resume.pdf","_blank"),a(!1),n&&m()};return e.createElement(e.Fragment,null,e.createElement("nav",{className:"navbar"},e.createElement("div",{className:"logo-section"},e.createElement("a",{href:"#home",onClick:w,className:"logo-link"},e.createElement("img",{src:Ee,alt:"Logo",className:"logo-image"}),e.createElement("span",{className:"logo-text"},"Ramkumar"))),!t&&e.createElement("div",{className:"nav-right"},e.createElement("ul",{className:"nav-list-right body-2"},e.createElement("li",null,e.createElement("a",{href:"#works"},"Works")),e.createElement("li",null,e.createElement("a",{href:"#about"},"About")),e.createElement("li",null,e.createElement("a",{href:"#process"},"Process"))),e.createElement("div",{className:"contact-section",ref:g},e.createElement("button",{ref:b,className:`contact-glow-button ${r?"active":""}`,onClick:R},e.createElement("span",{className:"button-inner"},e.createElement("span",{className:"button-text"},"Contact"),e.createElement("span",{className:`button-arrow ${r?"rotated":""}`},"▼"))),r&&e.createElement("div",{className:"dropdown-menu body-2",onMouseLeave:A},e.createElement("ul",null,e.createElement("li",{className:"contact-info"},e.createElement("p",null,e.createElement("img",{src:j,alt:"Email",className:"icon"}),e.createElement("span",null,"ramkumargd01@gmail.com")),e.createElement("button",{onClick:s=>f("ramkumargd01@gmail.com"),className:"copy-button","aria-label":"Copy email"},e.createElement("img",{src:$,alt:"Copy"}))),e.createElement("li",{className:"contact-info"},e.createElement("p",null,e.createElement("img",{src:V,alt:"Phone",className:"icon"}),e.createElement("span",null,"+91 9176750625")),e.createElement("button",{onClick:s=>f("+91 9176750625"),className:"copy-button","aria-label":"Copy phone"},e.createElement("img",{src:$,alt:"Copy"}))),e.createElement("div",{className:"dropdown-separator"}),e.createElement("li",{className:"dropdown-action"},e.createElement("button",{onClick:v,className:"dropdown-button"},e.createElement("span",null,"Open Contact Form"),e.createElement("span",{className:"action-arrow"},"→"))),e.createElement("li",{className:"dropdown-action"},e.createElement("button",{onClick:P,className:"dropdown-button"},e.createElement("span",null,"Download Resume"),e.createElement("span",{className:"action-arrow"},"↓"))))))),t&&e.createElement("div",{className:`hamburger-menu ${n?"active":""}`,onClick:m,"aria-expanded":n,"aria-label":"Toggle menu"},e.createElement("span",{className:"hamburger-bar"}),e.createElement("span",{className:"hamburger-bar"}),e.createElement("span",{className:"hamburger-bar"}))),t&&e.createElement("div",{id:"mobile-menu",className:`mobile-menu ${n?"open":""}`},e.createElement("ul",{className:"body-2"},e.createElement("li",null,e.createElement("a",{href:"#works",onClick:m},"Works")),e.createElement("li",null,e.createElement("a",{href:"#about",onClick:m},"About")),e.createElement("li",null,e.createElement("a",{href:"#process",onClick:m},"Process")),e.createElement("div",{className:"menu-separator"}),e.createElement("li",{className:"contact-info-mobile"},e.createElement("p",null,e.createElement("img",{src:j,alt:"Email",className:"icon"}),e.createElement("span",null,"ramkumargd01@gmail.com")),e.createElement("button",{onClick:()=>f("ramkumargd01@gmail.com"),className:"copy-button"},e.createElement("img",{src:$,alt:"Copy"}))),e.createElement("li",{className:"contact-info-mobile"},e.createElement("p",null,e.createElement("img",{src:V,alt:"Phone",className:"icon"}),e.createElement("span",null,"+91 9176750625")),e.createElement("button",{onClick:()=>f("+91 9176750625"),className:"copy-button"},e.createElement("img",{src:$,alt:"Copy"}))),e.createElement("div",{className:"menu-separator"}),e.createElement("li",null,e.createElement("button",{onClick:v,className:"mobile-action-button"},"Open Contact Form")),e.createElement("li",null,e.createElement("button",{onClick:P,className:"mobile-action-button"},"Download Resume")),e.createElement("div",{className:"menu-separator"}),e.createElement("li",{className:"mobile-social-container"},e.createElement("div",{className:"mobile-social-icons"},u.map((s,d)=>e.createElement("a",{key:d,href:s.link,target:"_blank",rel:"noopener noreferrer",className:"mobile-social-icon-link"},e.createElement("img",{src:s.default,alt:`Social Icon ${d+1}`,className:"mobile-social-icon",onMouseOver:y=>y.currentTarget.src=s.hover,onMouseOut:y=>y.currentTarget.src=s.default}))))))),e.createElement(ye,{isOpen:c,onClose:I}),e.createElement("div",{id:"toast-container"}))},xe=()=>{const r=[{default:"/assets/imgs/icons/social icons/01_Icon_Instagram.svg",hover:"/assets/imgs/icons/social icons/01_Icon_clr_Instagram.svg",link:"https://www.instagram.com/ramkumargd01"},{default:"/assets/imgs/icons/social icons/03_Icon_Behance.svg",hover:"/assets/imgs/icons/social icons/03_Icon_clr_Behance.svg",link:"https://www.behance.net/ramkumar6g80e6"},{default:"/assets/imgs/icons/social icons/04_Icon_Linkedin.svg",hover:"/assets/imgs/icons/social icons/04_Icon_clr_Linkedin.svg",link:"https://www.linkedin.com/in/ramkumar6g/"},{default:"/assets/imgs/icons/social icons/05_Icon_ADPlist.svg",hover:"/assets/imgs/icons/social icons/05_Icon_clr_ADPlist.svg",link:"https://adplist.org/mentors/ramkumar-g"}];return e.createElement("div",{className:"social-sidebar"},r.map((a,n)=>e.createElement("a",{key:n,href:a.link,target:"_blank",rel:"noopener noreferrer",className:"social-icon-link"},e.createElement("img",{src:a.default,alt:`Social Icon ${n+1}`,className:"social-icon",onMouseOver:l=>l.currentTarget.src=a.hover,onMouseOut:l=>l.currentTarget.src=a.default}))))},ke=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,Se=`
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uIntensity;
  uniform float uScrollProgress;
  uniform float uSectionIndex;
  varying vec2 vUv;

  void main() {
    vec2 F = vUv * uResolution;

    float i = 0.2, a;
    vec2 r = uResolution.xy;
    vec2 p = (F + F - r) / r.y / 0.7;
    vec2 d = vec2(-1.0, 1.0);
    vec2 b = p - i * d;
    vec2 c = p * mat2(1.0, 1.0, d / (0.1 + i / dot(b, b)));

    a = dot(c, c);

    vec2 v = c * mat2(
      cos(0.5 * log(a) + uTime * i), 
      -sin(0.5 * log(a) + uTime * i),
      sin(0.5 * log(a) + uTime * i), 
      cos(0.5 * log(a) + uTime * i)
    ) / i;

    vec4 w = vec4(0.0);
    for(float j = 1.0; j <= 9.0; j++) {
      v += 0.7 * sin(v.yx * j + uTime) / j + 0.5;
      w += 1.0 + sin(vec4(v.x, v.y, v.y, v.x));
      i += 1.0;
    }

    i = length(sin(v / 0.3) * 0.4 + c * (3.0 + d));

    // Section-based color palettes with higher contrast
    vec4 currentColor;
    
    if (uSectionIndex < 1.0) {
      // Home to Works transition - CYAN TO PINK (keep as is)
      vec4 colorStart = vec4(0.4, -0.2, -1.2, 0.0);  // Deep cyan
      vec4 colorMid = vec4(0.8, -0.6, -0.8, 0.0);    // Bright cyan-pink
      vec4 colorEnd = vec4(1.0, -0.8, -0.4, 0.0);    // Intense pink
      
      if (uScrollProgress < 0.5) {
        currentColor = mix(colorStart, colorMid, uScrollProgress * 2.0);
      } else {
        currentColor = mix(colorMid, colorEnd, (uScrollProgress - 0.5) * 2.0);
      }
    } 
    else if (uSectionIndex < 2.0) {
      // Works to About transition - PINK TO DEEP VIOLET/INDIGO
      vec4 colorStart = vec4(1.0, -0.8, -0.4, 0.0);    // From pink
      vec4 colorMid = vec4(0.2, -0.8, -1.5, 0.0);      // Deep violet (FIXED: was 'vecமid')
      vec4 colorEnd = vec4(-0.3, -0.5, -1.8, 0.0);     // Indigo blue
      
      float localProgress = fract(uScrollProgress);
      if (localProgress < 0.5) {
        currentColor = mix(colorStart, colorMid, localProgress * 2.0);
      } else {
        currentColor = mix(colorMid, colorEnd, (localProgress - 0.5) * 2.0);
      }
    }
    else if (uSectionIndex < 3.0) {
      // About to Process transition - INDIGO TO VIBRANT GREEN/YELLOW
      vec4 colorStart = vec4(-0.3, -0.5, -1.8, 0.0);   // From indigo
      vec4 colorMid = vec4(-0.5, -1.2, 0.3, 0.0);      // Vibrant green
      vec4 colorEnd = vec4(1.5, -1.0, 0.5, 0.0);       // Yellow-green
      
      float localProgress = fract(uScrollProgress);
      if (localProgress < 0.5) {
        currentColor = mix(colorStart, colorMid, localProgress * 2.0);
      } else {
        currentColor = mix(colorMid, colorEnd, (localProgress - 0.5) * 2.0);
      }
    }
    else if (uSectionIndex < 4.0) {
      // Process to Footer transition - YELLOW TO MAGENTA/RED
      vec4 colorStart = vec4(1.5, -1.0, 0.5, 0.0);     // From yellow
      vec4 colorMid = vec4(1.2, -0.3, -0.8, 0.0);      // Magenta
      vec4 colorEnd = vec4(1.8, -0.1, -0.3, 0.0);      // Red-orange
      
      float localProgress = fract(uScrollProgress);
      if (localProgress < 0.5) {
        currentColor = mix(colorStart, colorMid, localProgress * 2.0);
      } else {
        currentColor = mix(colorMid, colorEnd, (localProgress - 0.5) * 2.0);
      }
    }
    else {
      // Footer - RED TO CYAN (complete the circle)
      vec4 colorStart = vec4(1.8, -0.1, -0.3, 0.0);    // From red-orange
      vec4 colorEnd = vec4(0.4, -0.2, -1.2, 0.0);      // Back to deep cyan
      
      float localProgress = fract(uScrollProgress);
      currentColor = mix(colorStart, colorEnd, localProgress);
    }

    vec4 O = 1.0 - exp(
      -exp(c.x * currentColor)
      / w.xyyx
      / (2.0 + i * i / 4.0 - i)
      / (0.5 + 1.0 / a)
      / (0.03 + abs(length(p) - 0.7))
    );

    // Adjust intensity based on scroll for smoother transitions
    float dynamicIntensity = uIntensity * (0.4 + 0.6 * (1.0 - uScrollProgress * 0.5));
    O.rgb *= dynamicIntensity;
    O.a = max(max(O.r, O.g), O.b) * dynamicIntensity;

    gl_FragColor = O;
  }
`;function Ie({intensity:r=1,responsive:a={},transitionsEnabled:n=!0,scrollData:l={},currentSection:t="home"}){const i=o.useRef(),c=o.useRef(Date.now()),{viewport:E}=ee(),[g,b]=o.useState(0),_=o.useMemo(()=>new U({vertexShader:ke,fragmentShader:Se,uniforms:{uTime:{value:0},uResolution:{value:new Y(window.innerWidth,window.innerHeight)},uIntensity:{value:r},uScrollProgress:{value:0},uSectionIndex:{value:0}},transparent:!0,blending:K,depthWrite:!1,depthTest:!1}),[r]);o.useEffect(()=>{const f=()=>{_.uniforms.uResolution.value.set(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",f),()=>window.removeEventListener("resize",f)},[_]),o.useEffect(()=>{const h=["home","works","about","process","footer"].indexOf(t);b(h>=0?h:0)},[t]),te(()=>{if(!i.current)return;const f=(Date.now()-c.current)*.001;i.current.material.uniforms.uTime.value=f,i.current.material.uniforms.uIntensity.value=r,i.current.material.uniforms.uSectionIndex.value=g;const h=l.progress||0;i.current.material.uniforms.uScrollProgress.value=h,i.current.visible=!n});const u=a.isMobile?.7:1;return e.createElement("mesh",{ref:i,scale:[E.width*u,E.height*u,1],position:[0,0,-5]},e.createElement("planeGeometry",{args:[2,2]}),e.createElement("primitive",{object:_}))}const _e=({onReady:r})=>{const a=o.useRef(null),[n,l]=o.useState(!1),[t,i]=o.useState(!1),[c,E]=o.useState("home"),[g,b]=o.useState([]),[_,u]=o.useState(!1),f=o.useRef(new Map);o.useEffect(()=>{const m=()=>{const w=window.innerWidth<=768;l(w);const v=w||navigator.hardwareConcurrency<=2||navigator.deviceMemory<=4||window.matchMedia("(prefers-reduced-motion: reduce)").matches;i(v),u(window.matchMedia("(prefers-reduced-motion: reduce)").matches)};return m(),window.addEventListener("resize",m),()=>window.removeEventListener("resize",m)},[]);const h=o.useMemo(()=>({home:["Icon_brush","Icon_paint","Icon_pencil","Icon_illustrator","Icon_photoshop","Icon_aftereffects","Icon_magicwand","Icon_magictool","Icon_star","Icon_bulb"],works:["Icon_dev","Icon_laptop","Icon_devices","Icon_cube","Icon_cubesizing","Icon_layer","Icon_layout","Icon_expand","Icon_web","Icon_speed"],about:["Icon_smiley","Icon_hand","Icon_brain","Icon_crown","Icon_guitar","Icon_headphones","Icon_yoga","Icon_thinking","Icon_sing","Icon_book"],process:["Icon_clock","Icon_percentage","Icon_microscope","Icon_note","Icon_bank","Icon_gift","Icon_present","Icon_planet","Icon_satelit","Icon_joystick"],footer:["Icon_chat","Icon_camera","Icon_wallet","Icon_watch","Icon_tablet","Icon_typo","Rock 1","Rock 2","Icon_star","Icon_bulb"]}),[]);o.useEffect(()=>{(h[c]||h.home).forEach(w=>{if(!f.current.has(w)){const v=new Image;v.src=`/assets/imgs/icons/comets/${w}.svg`,f.current.set(w,v.src)}})},[c,h]),o.useEffect(()=>{let m,w=window.scrollY;const v=()=>{m||(m=requestAnimationFrame(()=>{const I=window.scrollY,P=document.body.scrollHeight-window.innerHeight,s=I/P;if(Math.abs(I-w)>10){const x=Math.floor(s*5);document.body.setAttribute("data-scroll-level",x.toString()),w=I}const d=["home","works","about","process","footer"];let y="home";for(const x of d){const N=document.getElementById(x==="home"?"hero":x);if(N){const k=N.getBoundingClientRect();if(k.top<=window.innerHeight/2&&k.bottom>=window.innerHeight/2){y=x;break}}}y!==c&&E(y),m=null}))};return window.addEventListener("scroll",v,{passive:!0}),()=>{m&&cancelAnimationFrame(m),window.removeEventListener("scroll",v)}},[c]),o.useEffect(()=>{if(_){b([]);return}const m=n?8:15,w=h[c]||h.home,v=Array.from({length:m},(I,P)=>{const s=w[P%w.length];return{id:`${c}-${P}`,icon:s,size:12+Math.random()*16,duration:10+Math.random()*15,delay:Math.random()*10,startX:Math.random()*100,startY:Math.random()*100,endX:Math.random()*100,endY:Math.random()*100}});b(v)},[c,n,_,h]),o.useEffect(()=>{if(n||_||!a.current)return;const m=document.createElement("canvas");if(!(m.getContext("webgl")||m.getContext("experimental-webgl")))return;const v=new ce,I=new le(75,window.innerWidth/window.innerHeight,.1,1e3);I.position.set(0,0,600);const P=new me({antialias:!t,alpha:!0,powerPreference:"high-performance"});P.setSize(window.innerWidth,window.innerHeight),P.setPixelRatio(Math.min(window.devicePixelRatio,t?1:2));const s=document.createElement("div");s.className="three-js-starfield",s.style.cssText=`
      position: fixed;
      z-index: -100;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `,s.appendChild(P.domElement),a.current.appendChild(s);const d=`
      varying vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,y=`
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uLayerCount;

      mat2 Rot(float a) {
          float s = sin(a), c = cos(a);
          return mat2(c, -s, s, c);
      }

      float SubtleStar(vec2 uv, float flare) {
          float d = length(uv);
          float m = 0.06 / d;
          float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 888.0));
          m += rays * flare * 0.1;
          uv *= Rot(3.1415 / 6.0);
          rays = max(0.0, 1.0 - abs(uv.x * uv.y * 888.0));
          m += rays * 0.6 * flare;
          m *= smoothstep(0.95, 0.1, d);
          return m;
      }

      float Hash21(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
      }

      vec3 SubtleStarLayer(vec2 uv) {
          vec3 col = vec3(0.0);
          vec2 gv = fract(uv) - 0.5;
          vec2 id = floor(uv);
          for (int y = -1; y <= 1; y++) {
              for (int x = -1; x <= 1; x++) {
                  vec2 offs = vec2(x, y);
                  float n = Hash21(id + offs);
                  float size = fract(n * 456.78) * 0.8;
                  float flare = smoothstep(0.4, 0.8, size);
                  flare *= abs(sin(uTime * 1.5));
                  float star = SubtleStar(gv - offs - vec2(n, fract(n * 68.0)) + 0.6, flare);
                  vec3 tint1 = vec3(0.4 + size * 0.2, 0.6, 0.6);
                  vec3 tint2 = vec3(0.4 + size * 0.2, 0.3, 0.3);
                  vec3 color = mix(tint1, tint2, abs(cos(uTime)) + n);
                  color *= fract(n * 1234.5) * 0.6;
                  star *= sin(uTime * 3.0 + n * 6.2821) * 0.3 + 0.6;
                  col += star * size * color;
              }
          }
          return col * 0.8;
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
          vec2 M = (uMouse.xy - uResolution.xy * 0.5) / uResolution.y;
          float t = uTime * 0.06;
          uv *= Rot(t);
          vec3 col = vec3(0.0);
          for (float i = 0.0; i < uLayerCount; i += 1.0) {
              float depth = fract(i / uLayerCount + t);
              float scale = mix(16.0, 0.5, depth);
              float fade = depth * smoothstep(1.5, 0.9, depth);
              col += SubtleStarLayer(uv * scale + i * 456.45 - M) * fade;
          }
          gl_FragColor = vec4(col, 0.6);
      }
    `,x=new ue(6e3,6e3),N=new U({vertexShader:d,fragmentShader:y,uniforms:{uTime:{value:0},uResolution:{value:new Y(window.innerWidth,window.innerHeight)},uMouse:{value:new Y(0,0)},uLayerCount:{value:t?2:3}},transparent:!0,depthTest:!1,blending:K}),k=new de(x,N);v.add(k);let M=t?2:3,z;const F=()=>{if(!t){const p=window.scrollY||window.pageYOffset,C=document.body.scrollHeight-window.innerHeight;M=fe.clamp(3+p/C*3,3,6)}},D=p=>{N.uniforms.uMouse.value.x=p.clientX,N.uniforms.uMouse.value.y=p.clientY};t||(window.addEventListener("scroll",F,{passive:!0}),window.addEventListener("mousemove",D,{passive:!0}));const S=()=>{z=requestAnimationFrame(S);const p=performance.now()*.001;N.uniforms.uTime.value=p,t||(N.uniforms.uLayerCount.value+=(M-N.uniforms.uLayerCount.value)*.1),P.render(v,I)},T=()=>{const p=window.innerWidth,C=window.innerHeight;I.aspect=p/C,I.updateProjectionMatrix(),P.setSize(p,C),N.uniforms.uResolution.value.set(p,C)};return window.addEventListener("resize",T),S(),()=>{cancelAnimationFrame(z),window.removeEventListener("resize",T),window.removeEventListener("scroll",F),window.removeEventListener("mousemove",D),s&&a.current&&a.current.contains(s)&&a.current.removeChild(s),x.dispose(),N.dispose(),P.dispose(),v.clear()}},[n,_,t]);const R=o.useMemo(()=>t||n?()=>null:()=>e.createElement("div",{className:"css-lemniscates"},Array.from({length:20},(m,w)=>e.createElement("div",{key:`lem-${w}`,className:`lemniscate lemniscate-${w%3+1}`,style:{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animationDelay:`${Math.random()*-10}s`}}))),[t,n]),A=o.useMemo(()=>()=>e.createElement("div",{className:"css-comets","data-section":c},g.map(m=>e.createElement("div",{key:m.id,className:"css-comet",style:{backgroundImage:`url('${f.current.get(m.icon)||`/assets/imgs/icons/comets/${m.icon}.svg`}')`,"--size":`${m.size}px`,"--duration":`${m.duration}s`,"--delay":`${m.delay}s`,"--start-x":`${m.startX}vw`,"--start-y":`${m.startY}vh`,"--end-x":`${m.endX}vw`,"--end-y":`${m.endY}vh`}}))),[g,c]);return o.useEffect(()=>{const m=setTimeout(()=>{r&&r()},100);return()=>clearTimeout(m)},[r]),e.createElement(e.Fragment,null,e.createElement("div",{ref:a}),e.createElement(R,null),e.createElement(A,null))};function Ne({lenis:r,responsive:a={},enabled:n=!0,intensity:l=1,idleThresholdMs:t=700,fadeLerpSpeed:i=.05,enableMouse:c=!0,zoomAmount:E=1.12,modelOffset:g=2,...b}){const _=o.useRef(),[u,f]=o.useState({velocity:0,direction:0,progress:0,isScrolling:!1}),[h,R]=o.useState(!0),[A,m]=o.useState("home"),[w,v]=o.useState(!1),[I,P]=o.useState(!1),s=o.useRef(null),d=o.useRef(Date.now()),y=o.useRef(null),x=o.useRef([]),N=o.useRef({home:{top:0,bottom:0},works:{top:0,bottom:0},about:{top:0,bottom:0},process:{top:0,bottom:0},footer:{top:0,bottom:0}}),k=S=>(x.current.push(S),x.current.length>5&&x.current.shift(),x.current.reduce((p,C)=>p+C,0)/x.current.length);o.useEffect(()=>{const S=()=>{["home","works","about","process","footer"].forEach(p=>{const C=document.getElementById(p==="home"?"hero":p);if(C){const O=C.getBoundingClientRect();N.current[p]={top:O.top+window.scrollY,bottom:O.bottom+window.scrollY}}})};return S(),window.addEventListener("resize",S),window.addEventListener("load",S),setTimeout(S,1e3),()=>{window.removeEventListener("resize",S),window.removeEventListener("load",S)}},[]);const M=S=>{const T=N.current;let p="home";S>=T.footer.top?p="footer":S>=T.process.top?p="process":S>=T.about.top?p="about":S>=T.works.top?p="works":p="home",m(p)};o.useEffect(()=>{if(!r)return;const S=T=>{const p=Date.now();d.current=p;const C=k(T.velocity||0),O=typeof T.scroll=="number"?T.scroll:window.scrollY;M(O),f({velocity:C,direction:T.direction||0,progress:T.progress||0,isScrolling:!0}),R(!1),s.current&&clearTimeout(s.current),s.current=setTimeout(()=>{R(!0),f(H=>({...H,isScrolling:!1,velocity:0}))},t)};return r.on("scroll",S),()=>{r.off("scroll",S),s.current&&clearTimeout(s.current)}},[r,t]),o.useEffect(()=>{if(r)return;let S=window.scrollY;const T=()=>{const C=window.scrollY,O=C-S;S=C,M(C);const H=k(O);f(J=>({...J,velocity:H*.5,direction:O>0?1:O<0?-1:0,progress:document.body.scrollHeight-window.innerHeight>0?C/(document.body.scrollHeight-window.innerHeight):0})),y.current=requestAnimationFrame(T)},p=()=>{d.current=Date.now(),R(!1),f(C=>({...C,isScrolling:!0})),s.current&&clearTimeout(s.current),s.current=setTimeout(()=>{R(!0),f(C=>({...C,isScrolling:!1,velocity:0}))},t)};return window.addEventListener("scroll",p,{passive:!0}),window.addEventListener("wheel",p,{passive:!0}),window.addEventListener("touchmove",p,{passive:!0}),y.current=requestAnimationFrame(T),()=>{window.removeEventListener("scroll",p),window.removeEventListener("wheel",p),window.removeEventListener("touchmove",p),y.current&&cancelAnimationFrame(y.current),s.current&&clearTimeout(s.current)}},[r,t]);const z=()=>{v(!0)};if(o.useEffect(()=>{if(_.current){const S=setTimeout(()=>{P(!0)},100);return()=>clearTimeout(S)}},[_.current]),o.useEffect(()=>{w&&I&&(window.dispatchEvent(new CustomEvent("orchestrator-ready")),document.body.classList.add("effects-ready"))},[w,I]),!n)return null;const D=a.isMobile?{dpr:[.8,1.2],antialias:!1,toneMapping:pe,toneMappingExposure:1}:a.isTablet?{dpr:[1,1.5],antialias:!0,toneMapping:ge,toneMappingExposure:1.1}:{dpr:[1,2],antialias:!0,toneMapping:he,toneMappingExposure:1.2};return e.createElement("div",{className:"parallax-canvas-container",style:{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1,opacity:w?1:0,transition:"opacity 0.6s ease-out"}},e.createElement(_e,{onReady:z}),w&&e.createElement(oe,{ref:_,camera:{position:[0,0,5],fov:75,near:.1,far:100},gl:{alpha:!0,antialias:D.antialias,toneMapping:D.toneMapping,toneMappingExposure:D.toneMappingExposure,powerPreference:a.isMobile?"default":"high-performance"},dpr:D.dpr,style:{position:"absolute",top:0,left:0,width:"100%",height:"100%"}},e.createElement(o.Suspense,{fallback:null},e.createElement(Ie,{intensity:l,responsive:a,transitionsEnabled:!1,scrollData:u,isIdle:h,currentSection:A,zoomAmount:E,modelOffset:g,enableMouse:c,fadeLerpSpeed:i,...b}),e.createElement(ne,{all:!0}))))}const Ce=e.lazy(()=>W(()=>import("./Home-Dr5dYWNy.js"),__vite__mapDeps([0,1,2,3]))),Me=e.lazy(()=>W(()=>import("./Works-yb_-KwLj.js"),__vite__mapDeps([4,1,2,3]))),Pe=e.lazy(()=>W(()=>import("./About-C5C7s5re.js"),__vite__mapDeps([5,1,2,3]))),Te=e.lazy(()=>W(()=>import("./Process-aRzxEqIp.js"),__vite__mapDeps([6,1,2,3]))),Le=e.lazy(()=>W(()=>import("./Footer-CeLRrIfw.js"),__vite__mapDeps([7,1,2,3,8])));L.registerPlugin(q);const Re=()=>{const r=o.useRef(null),[a,n]=o.useState({isMobile:window.innerWidth<768,isTablet:window.innerWidth<1024});return o.useEffect(()=>{const l=()=>{n({isMobile:window.innerWidth<768,isTablet:window.innerWidth<1024})};return window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[]),o.useEffect(()=>{const l=new ie({duration:1.2,easing:i=>Math.min(1,1.001-Math.pow(2,-10*i)),orientation:"vertical",smoothWheel:!0,wheelMultiplier:1,touchMultiplier:2});r.current=l,l.on("scroll",q.update);const t=i=>{l.raf(i*1e3)};return L.ticker.add(t),L.ticker.lagSmoothing(0),()=>{l.destroy(),L.ticker.remove(t)}},[]),e.createElement(e.Fragment,null,e.createElement("div",{className:"Background-Animation"},e.createElement(Ne,{lenis:r.current,responsive:a,intensity:1,enabled:!0,idleThresholdMs:700,fadeLerpSpeed:.05,zoomAmount:1.12,modelOffset:2,enableMouse:!0})),e.createElement(be,null),e.createElement(xe,null),e.createElement("main",null,e.createElement(o.Suspense,{fallback:e.createElement("div",{className:"section-loader"},"Loading...")},e.createElement(Ce,null)),e.createElement(o.Suspense,{fallback:e.createElement("div",{className:"section-loader"},"Loading...")},e.createElement(Me,null)),e.createElement(o.Suspense,{fallback:e.createElement("div",{className:"section-loader"},"Loading...")},e.createElement(Pe,null)),e.createElement(o.Suspense,{fallback:e.createElement("div",{className:"section-loader"},"Loading...")},e.createElement(Te,null)),e.createElement(o.Suspense,{fallback:e.createElement("div",{className:"section-loader"},"Loading...")},e.createElement(Le,null))))},B={measurementId:"G-XF1B91ZJZJ",privacy:{bannerDelay:2e3,consentExpiry:365,analytics:{anonymizeIp:!0,allowGoogleSignals:!1,allowAdPersonalization:!1,cookieFlags:"SameSite=Strict;Secure",dataRetention:"short"}},targetMarkets:{primary:["Chennai, Tamil Nadu, India","Bangalore, Karnataka, India","London, UK","Birmingham, UK","Manchester, UK","Liverpool, UK","Glasgow, UK","Dublin, Ireland"],timeZones:{India:"Asia/Kolkata",UK:"Europe/London",Ireland:"Europe/Dublin"}},events:{resumeDownload:{eventName:"resume_download",category:"engagement",action:"download",label:"resume_pdf"},caseStudyView:{eventName:"case_study_view",category:"portfolio",action:"view"},caseStudyClick:{eventName:"case_study_click",category:"portfolio",action:"external_link"},contactFormOpen:{eventName:"contact_form_open",category:"lead_generation",action:"form_open"},contactFormSubmit:{eventName:"contact_form_submit",category:"lead_generation",action:"form_submit"},sectionView:{eventName:"section_view",category:"navigation",action:"scroll_to_section"}},cookieCategories:{necessary:{name:"Necessary Cookies",description:"Essential for the website to function properly. Cannot be disabled.",required:!0,cookies:["cookie-consent","cookie-preferences","consent-date"]},analytics:{name:"Analytics Cookies",description:"Help us understand how visitors interact with our website (Google Analytics).",required:!1,cookies:["_ga","_ga_*","_gid","_gat"]},functional:{name:"Functional Cookies",description:"Enable enhanced functionality and personalization.",required:!1,cookies:["user-preferences","theme-selection"]}},legal:{companyName:"Ramkumar Portfolio",contactEmail:"ramkumargd01@gmail.com",phone:"+91-9176750625",location:"Chennai, Tamil Nadu, India",website:"https://www.ramkumarux.com",privacyPolicyLastUpdated:new Date().toISOString().split("T")[0],gdprApplicable:!0,dataProcessingLawfulBasis:"consent"},development:{debugMode:!1,consoleLogging:!1,testMode:!1}},ze=()=>B.measurementId,Ae=()=>!0,X=r=>r&&B.measurementId&&Ae(),De=(r,a={})=>{const n=B.events[r];if(!n||typeof window>"u"||!window.gtag||!X(!0))return;const t={event_category:n.category,event_label:a.label||n.label,...a};Object.keys(t).forEach(i=>{t[i]===void 0&&delete t[i]}),window.gtag("event",n.eventName,t)},Fe=()=>{try{const r=localStorage.getItem("cookie-consent"),a=JSON.parse(localStorage.getItem("cookie-preferences")||"{}");return r==="given"&&a.analytics===!0}catch{return!1}},Oe=r=>new Promise((a,n)=>{if(document.querySelector(`script[src="${r}"]`)){a();return}const l=document.createElement("script");l.async=!0,l.src=r,l.onload=a,l.onerror=n,document.head.appendChild(l)}),Be=r=>{window.dataLayer=window.dataLayer||[];function a(){window.dataLayer.push(arguments)}window.gtag=a,a("js",new Date);const n=B.privacy.analytics;a("config",r,{anonymize_ip:n.anonymizeIp,allow_google_signals:n.allowGoogleSignals,allow_ad_personalization_signals:!1,cookie_flags:n.cookieFlags,debug_mode:B.development.debugMode})};function We(){const r=o.useRef(!1);return o.useEffect(()=>{const a=async()=>{const l=ze(),t=Fe();!X(t)||r.current||(await Oe(`https://www.googletagmanager.com/gtag/js?id=${l}`),Be(l),r.current=!0)};a();const n=()=>{r.current||a()};return window.addEventListener("cookie-consent-updated",n),()=>window.removeEventListener("cookie-consent-updated",n)},[]),null}const $e=({onConsentChange:r})=>{const[a,n]=o.useState(!1),[l,t]=o.useState(!1),i=o.useRef(null),c=o.useRef(null);o.useEffect(()=>{(()=>{const f=localStorage.getItem("cookie-consent"),h=localStorage.getItem("cookie-preferences"),R=localStorage.getItem("consent-date");if(f&&R){const A=new Date(R),m=new Date;m.setDate(m.getDate()-B.privacy.consentExpiry),A<m&&(localStorage.removeItem("cookie-consent"),localStorage.removeItem("cookie-preferences"),localStorage.removeItem("consent-date"))}if(!f)setTimeout(()=>{n(!0),E()},500);else if(h)try{const A=JSON.parse(h);r==null||r(A.analytics||!1)}catch(A){console.warn("Error parsing saved cookie preferences:",A),localStorage.removeItem("cookie-preferences"),n(!0),setTimeout(E,500)}})()},[r]);const E=()=>{!i.current||l||(t(!0),c.current=L.timeline({onComplete:()=>t(!1)}),L.set(i.current,{y:100,opacity:0,scale:.95,filter:"blur(10px)"}),c.current.to(i.current,{y:0,opacity:1,scale:1,filter:"blur(0px)",duration:.8,ease:"power3.out"}).to(i.current.querySelector(".cookie-content"),{opacity:1,y:0,duration:.6,ease:"power2.out"},"-=0.4").to(i.current.querySelector(".cookie-btn"),{opacity:1,scale:1,duration:.4,ease:"back.out(1.7)"},"-=0.3"))},g=u=>{!i.current||l||(t(!0),L.to(i.current,{y:100,opacity:0,scale:.9,filter:"blur(8px)",duration:.6,ease:"power2.in",onComplete:()=>{n(!1),t(!1)}}))},b=(u=!0)=>{const f={necessary:!0,analytics:u,functional:!1,marketing:!1},h={given:!0,date:new Date().toISOString(),preferences:f,version:"1.0",userAgent:navigator.userAgent.substring(0,100)};localStorage.setItem("cookie-consent","given"),localStorage.setItem("cookie-preferences",JSON.stringify(f)),localStorage.setItem("consent-date",h.date),u&&setTimeout(()=>{De("contactFormOpen",{label:"cookie_consent_accepted",value:1})},1e3)},_=()=>{l||(b(!0),r==null||r(!0),g())};return o.useEffect(()=>()=>{c.current&&c.current.kill()},[]),a?e.createElement("div",{ref:i,className:"cookie-banner",role:"dialog","aria-labelledby":"cookie-title","aria-describedby":"cookie-description"},e.createElement("div",{className:"cookie-content"},e.createElement("div",{className:"cookie-header"},e.createElement("span",{className:"cookie-icon"},"🍪")),e.createElement("p",{id:"cookie-description",className:"cookie-description footnote"},"To give you the best experience, I use analytics with your privacy fully protected."),e.createElement("div",{className:"cookie-actions"},e.createElement("button",{onClick:_,className:"cookie-btn accept-all",disabled:l,"aria-label":"Accept analytics cookies"},e.createElement("span",{className:"btn-text caption-text-label"},"GOT IT"),e.createElement("span",{className:"btn-glow"})))),e.createElement("div",{className:"cookie-bg-glow","aria-hidden":"true"})):null},He=()=>{const[r,a]=o.useState(!1),[n,l]=o.useState(!1);o.useEffect(()=>{(()=>{try{const E=localStorage.getItem("cookie-consent"),g=localStorage.getItem("cookie-preferences");if(E==="given"&&g){const b=JSON.parse(g);l(b.analytics||!1)}}catch(E){console.warn("Error loading saved consent preferences:",E)}})()},[]);const t=()=>{const c=document.querySelector(".loader");c?(c.style.transition="opacity 0.8s ease",c.style.opacity="0",setTimeout(()=>{a(!0)},800)):a(!0)},i=c=>{l(c),window.dispatchEvent(new CustomEvent("cookie-consent-updated",{detail:{analyticsConsent:c}}))};return e.createElement(e.Fragment,null,!r&&e.createElement(ve,{onComplete:t}),r&&e.createElement("div",{style:{animation:"fadeIn 1s ease-out",opacity:1}},e.createElement(Re,null),e.createElement(We,{consentGiven:n}),e.createElement($e,{onConsentChange:i})),e.createElement(we,null))},Ye=()=>e.createElement(e.Fragment,null,e.createElement("div",{id:"nebula-bg"}),e.createElement(se,null,e.createElement(He,null)));ae.createRoot(document.getElementById("root")).render(e.createElement(e.StrictMode,null,e.createElement(Ye,null)));export{ye as F};
