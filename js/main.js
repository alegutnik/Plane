// FAQ accordion
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>{
    const item=q.parentElement;
    const a=item.querySelector('.faq-a');
    const isActive=item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i=>{
      i.classList.remove('active');
      i.querySelector('.faq-a').style.maxHeight=null;
    });
    if(!isActive){
      item.classList.add('active');
      a.style.maxHeight=a.scrollHeight+'px';
    }
  });
});

// Scroll fade-up animation
const obs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}
  });
},{threshold:.15});
document.querySelectorAll('.fade-up').forEach(el=>obs.observe(el));

// Mobile: auto-glow audience cards on scroll
const glowObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('glow')}
    else{e.target.classList.remove('glow')}
  });
},{threshold:.6});
if(window.innerWidth<=900){
  document.querySelectorAll('.audience-card').forEach(el=>glowObs.observe(el));
}

// Reviews carousel
(function(){
  const track=document.getElementById('reviews-track');
  const dotsBox=document.getElementById('reviews-dots');
  if(!track||!dotsBox)return;
  const slides=track.querySelectorAll('.review-slide');
  const prev=document.querySelector('.reviews-prev');
  const next=document.querySelector('.reviews-next');
  slides.forEach((_,i)=>{
    const b=document.createElement('button');
    b.addEventListener('click',()=>goTo(i));
    dotsBox.appendChild(b);
  });
  const dots=dotsBox.querySelectorAll('button');
  function goTo(i){
    track.scrollTo({left:slides[i].offsetLeft-track.offsetLeft,behavior:'smooth'});
  }
  function updateActive(){
    const i=Math.round(track.scrollLeft/track.clientWidth);
    dots.forEach((d,idx)=>d.classList.toggle('active',idx===i));
  }
  track.addEventListener('scroll',()=>{
    clearTimeout(track._t);
    track._t=setTimeout(updateActive,80);
  });
  prev&&prev.addEventListener('click',()=>{
    const i=Math.round(track.scrollLeft/track.clientWidth);
    goTo(Math.max(0,i-1));
  });
  next&&next.addEventListener('click',()=>{
    const i=Math.round(track.scrollLeft/track.clientWidth);
    goTo(Math.min(slides.length-1,i+1));
  });
  updateActive();
})();
