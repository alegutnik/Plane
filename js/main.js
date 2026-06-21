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
