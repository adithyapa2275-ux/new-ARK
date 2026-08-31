document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const bgHeartsContainer = document.getElementById('bg-hearts');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  
  const cardProposal = document.getElementById('card-proposal');
  const cardCelebration = document.getElementById('card-celebration');
  const cardPlanner = document.getElementById('card-planner');
  const cardConfirmation = document.getElementById('card-confirmation');
  
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const btnGoToPlanner = document.getElementById('btn-go-to-planner');
  const btnRestart = document.getElementById('btn-restart');
  
  const datePlannerForm = document.getElementById('date-planner-form');
  const dateSelect = document.getElementById('date-select');
  
  // Set minimum date of planner to today
  const today = new Date().toISOString().split('T')[0];
  dateSelect.min = today;
  dateSelect.value = today;

  // Interactivity state
  let noCount = 0;
  let hasInteracted = false;
  
  const noTexts = [
    "No",
    "Are you sure? 🥺",
    "Think again! 💕",
    "Please? ❤️",
    "Surely not! 😭",
    "Incorrect choice! ❌",
    "You can't click this! 😂",
    "Yes is the only option!",
    "Give it a chance! 🥰",
    "Just click Yes! 😘"
  ];

  /* ==========================================================================
     1. Floating Hearts & Butterflies Background System
     ========================================================================== */
  function createFloatingParticle() {
    const particle = document.createElement('div');
    particle.classList.add('floating-heart');
    
    // Random butterflies, hearts, and magical sparkles
    const symbols = ['🦋', '🦋', '💖', '✨', '🦋', '🌸', '💕', '🦋', '💜'];
    const chosenSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    particle.innerText = chosenSymbol;
    
    // Randomize positioning and size
    const size = chosenSymbol === '🦋' ? (Math.random() * 16 + 18) : (Math.random() * 16 + 12);
    particle.style.fontSize = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    
    // Randomize animations
    const duration = Math.random() * 6 + 6; // 6s to 12s
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${Math.random() * 2}s`;
    
    bgHeartsContainer.appendChild(particle);
    
    // Remove particle after animation finishes to prevent DOM bloating
    setTimeout(() => {
      particle.remove();
    }, duration * 1000);
  }

  // Generate background particles periodically
  setInterval(createFloatingParticle, 550);
  // Create initial burst
  for (let i = 0; i < 18; i++) {
    setTimeout(createFloatingParticle, Math.random() * 3000);
  }

  /* ==========================================================================
     2. Music Audio Controls
     ========================================================================== */
  function playAudio() {
    bgMusic.play().then(() => {
      musicToggle.classList.add('playing');
      musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
    }).catch(err => {
      console.log("Autoplay prevented or audio error:", err);
    });
  }

  function pauseAudio() {
    bgMusic.pause();
    musicToggle.classList.remove('playing');
    musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
  }

  function toggleMusic() {
    if (bgMusic.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  // Attempt to start music on first user click anywhere on screen
  document.body.addEventListener('click', () => {
    if (!hasInteracted) {
      hasInteracted = true;
      playAudio();
    }
  }, { once: true });

  /* ==========================================================================
     3. "No" Button Playful Behavior (Runs away & shrinks)
     ========================================================================== */
  function handleNoInteraction(isHover) {
    if (isHover && noCount < 4) {
      // Do not run away on hover if clicked less than 4 times
      return;
    }

    noCount++;
    
    // Change Button Text
    const textIndex = Math.min(noCount, noTexts.length - 1);
    btnNo.innerText = noTexts[textIndex];
    
    // Scale "No" button down & "Yes" button up
    const noScale = Math.max(0.3, 1 - noCount * 0.12);
    const yesScale = Math.min(2.5, 1 + noCount * 0.18);
    
    btnNo.style.transform = `scale(${noScale})`;
    btnYes.style.transform = `scale(${yesScale})`;
    
    // Make button escape to random coordinates on 5th interaction onwards
    if (noCount >= 5) {
      if (btnNo.style.position !== 'fixed') {
        btnNo.style.position = 'fixed';
        btnNo.style.zIndex = '99';
      }
      
      // Keep target inside viewport paddings dynamically based on screen width
      const padding = window.innerWidth < 500 ? 20 : 60;
      const maxX = Math.max(padding, window.innerWidth - btnNo.offsetWidth - padding);
      const maxY = Math.max(padding, window.innerHeight - btnNo.offsetHeight - padding);
      
      const randomX = Math.floor(Math.random() * (maxX - padding + 1)) + padding;
      const randomY = Math.floor(Math.random() * (maxY - padding + 1)) + padding;
      
      btnNo.style.left = `${randomX}px`;
      btnNo.style.top = `${randomY}px`;
    }
  }

  // Trigger escape on hover and click
  btnNo.addEventListener('mouseenter', () => handleNoInteraction(true));
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    handleNoInteraction(false);
  });
  
  // Touch support for mobile devices
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleNoInteraction(false);
  });

  /* ==========================================================================
     4. Canvas Confetti System
     ========================================================================== */
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  
  let confettiActive = false;
  let confettiParticles = [];
  const colors = [
    '#ff4757', '#ff6b81', '#70a1ff', '#7bed9f', 
    '#eccc68', '#ff7f50', '#a4b0be', '#e056fd'
  ];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height - 20;
      this.size = Math.random() * 5 + 4; // Slightly smaller size
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speed = Math.random() * 2.5 + 2.5; // Falls slower
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 2.5 - 1.25;
      this.wobble = Math.random() * 10;
      this.wobbleSpeed = Math.random() * 0.04 + 0.01;
      this.opacity = 1.0;
    }

    update() {
      this.y += this.speed;
      this.rotation += this.rotationSpeed;
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * 1.2;

      // Start fading out once they reach bottom 40% of the viewport
      if (this.y > canvas.height * 0.6) {
        this.opacity -= 0.015;
        if (this.opacity < 0) this.opacity = 0;
      }

      // Reset when particle falls off screen
      if (this.y > canvas.height) {
        if (confettiActive) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
          this.opacity = 1.0;
        }
      }
    }

    draw() {
      if (this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function setupConfetti(amount = 45) {
    confettiParticles = [];
    for (let i = 0; i < amount; i++) {
      confettiParticles.push(new ConfettiParticle());
    }
  }

  function startConfetti(amount = 45) {
    if (confettiActive) return;
    confettiActive = true;
    setupConfetti(amount);
    animateConfetti();
  }

  function stopConfetti() {
    confettiActive = false;
  }

  function animateConfetti() {
    if (!confettiActive && confettiParticles.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiParticles.forEach((p, index) => {
      p.update();
      p.draw();
      
      // If we turned it off or it faded completely, remove from array
      if ((!confettiActive && p.y > canvas.height) || p.opacity <= 0) {
        confettiParticles.splice(index, 1);
      }
    });

    requestAnimationFrame(animateConfetti);
  }

  /* ==========================================================================
     5. Navigation & Screen Transitions
     ========================================================================== */
  function switchCard(fromCard, toCard) {
    fromCard.classList.remove('active');
    fromCard.classList.add('hidden');
    
    // Allow animation delay
    setTimeout(() => {
      toCard.classList.remove('hidden');
      toCard.classList.add('active');
    }, 400);
  }

  // Yes button action
  btnYes.addEventListener('click', () => {
    startConfetti(40); // 40 particles for a subtle, beautiful burst
    playAudio();
    switchCard(cardProposal, cardCelebration);
    
    // Stop confetti after 5 seconds
    setTimeout(stopConfetti, 5000);
  });

  // Go to Planner screen
  btnGoToPlanner.addEventListener('click', () => {
    switchCard(cardCelebration, cardPlanner);
  });

  /* ==========================================================================
     6. Date Planner Form Submit
     ========================================================================== */
  datePlannerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dateVal = dateSelect.value;
    const timeVal = document.getElementById('time-select').value;
    
    // Get active radio activity
    const activityVal = document.querySelector('input[name="activity"]:checked').value;
    const dessertVal = document.getElementById('dessert-input').value;
    
    // Formatting Date: e.g. "Sunday, September 10, 2026"
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateVal).toLocaleDateString(undefined, options);
    
    // Formatting Time: e.g. "07:30 PM"
    let formattedTime = timeVal;
    if (timeVal) {
      const [hours, minutes] = timeVal.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      formattedTime = `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }
    
    // Set UI values
    document.getElementById('sum-date').innerText = formattedDate;
    document.getElementById('sum-time').innerText = formattedTime;
    document.getElementById('sum-activity').innerText = activityVal;
    document.getElementById('sum-dessert').innerText = dessertVal;
    
    // Transition card & trigger small celebration burst
    switchCard(cardPlanner, cardConfirmation);
    startConfetti(20); // 20 particles for a small confirmation burst
    setTimeout(stopConfetti, 3000);
  });

  /* ==========================================================================
     7. Restart Proposal Card Flow
     ========================================================================== */
  btnRestart.addEventListener('click', () => {
    // Reset inputs
    datePlannerForm.reset();
    dateSelect.value = today;
    
    // Reset styles
    btnNo.style.position = '';
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.transform = '';
    btnYes.style.transform = '';
    btnNo.innerText = "No";
    noCount = 0;
    
    // Go to proposal screen
    switchCard(cardConfirmation, cardProposal);
  });
});
