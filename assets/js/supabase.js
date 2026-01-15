// =====================================================
// SUPABASE CONFIGURATION - Scopus Journal Publisher
// =====================================================

const SUPABASE_URL = 'https://dbppxzkkgdtnmikkviyt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EK1SAhvQC5RvjagfJR7NLA_TaqRCpnx';

// Initialize Supabase client
let supabaseClient = null;

function initSupabase() {
  try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase initialized successfully');
      return true;
    } else {
      console.error('❌ Supabase library not loaded');
      return false;
    }
  } catch (err) {
    console.error('❌ Supabase init error:', err);
    return false;
  }
}

// =====================================================
// FORM SUBMISSION TO SUPABASE
// =====================================================

async function submitToSupabase(formData) {
  console.log('📤 Submitting data to Supabase...');
  console.log('Data:', formData);

  if (!supabaseClient) {
    console.log('Initializing Supabase client...');
    initSupabase();
  }

  if (!supabaseClient) {
    return { success: false, message: 'Database connection failed. Please try again.' };
  }

  try {
    // Prepare clean data - include form_type which is required
    const insertData = {
      name: String(formData.name || '').trim(),
      email: String(formData.email || '').trim(),
      phone: String(formData.phone || '').trim(),
      service: formData.service ? String(formData.service).trim() : null,
      message: formData.message ? String(formData.message).trim() : null,
      form_type: formData.form_type || 'quote'  // Required field!
    };

    console.log('📋 Insert data:', insertData);

    const { data, error } = await supabaseClient
      .from('quotes_and_inquiries')
      .insert([insertData])
      .select();

    if (error) {
      console.error('❌ Supabase error:', error);
      return { 
        success: false, 
        message: 'Failed to save: ' + (error.message || 'Unknown error'),
        error: error 
      };
    }

    console.log('✅ Data saved successfully:', data);
    return { 
      success: true, 
      message: 'Thank you! Your inquiry has been received. We will contact you soon.',
      data: data 
    };

  } catch (err) {
    console.error('❌ Exception:', err);
    return { 
      success: false, 
      message: 'An error occurred. Please try again.',
      error: err 
    };
  }
}

// =====================================================
// ALERT DISPLAY
// =====================================================

function showFormAlert(message, isSuccess) {
  // Remove existing alerts
  document.querySelectorAll('.supabase-alert').forEach(el => el.remove());

  const alertDiv = document.createElement('div');
  alertDiv.className = 'supabase-alert alert ' + (isSuccess ? 'alert-success' : 'alert-danger');
  alertDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;padding:15px 30px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);min-width:300px;text-align:center;';
  alertDiv.innerHTML = message;
  
  document.body.appendChild(alertDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// =====================================================
// FORM SUBMISSION HANDLER
// =====================================================

async function handleFormSubmission(event) {
  event.preventDefault();
  event.stopPropagation();
  
  console.log('🚀 Form submission started');
  
  const form = event.target;
  
  // Get form values
  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  const serviceSelect = form.querySelector('select[name="service"]');
  const messageInput = form.querySelector('textarea[name="message"]');

  // Validate required fields
  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';

  if (!name || !email || !phone) {
    showFormAlert('Please fill in all required fields (Name, Email, Phone)', false);
    return false;
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFormAlert('Please enter a valid email address', false);
    return false;
  }

  // Determine form type - modal forms are 'quote', page forms are 'contact'
  const isModalForm = form.closest('.modal') !== null;
  const formType = isModalForm ? 'quote' : 'contact';

  // Prepare form data
  const formData = {
    name: name,
    email: email,
    phone: phone,
    service: serviceSelect ? serviceSelect.value : null,
    message: messageInput ? messageInput.value.trim() : null,
    form_type: formType  // Required by Supabase table
  };

  // Get submit button and show loading
  const submitBtn = form.querySelector('button[type="submit"]');
  let originalBtnText = '';
  
  if (submitBtn) {
    originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Submitting...</span>';
  }

  // Submit to Supabase
  const result = await submitToSupabase(formData);

  // Reset button
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }

  // Show result
  if (result.success) {
    showFormAlert('✅ ' + result.message, true);
    form.reset();
    
    // Close modal if form is inside one
    const modal = form.closest('.modal');
    if (modal && typeof bootstrap !== 'undefined') {
      try {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          setTimeout(() => bsModal.hide(), 1500);
        }
      } catch (e) {
        console.log('Modal close error:', e);
      }
    }
  } else {
    showFormAlert('❌ ' + result.message, false);
  }

  return false;
}

// Contact form handler alias
function handleContactFormSubmit(event) {
  return handleFormSubmission(event);
}

// =====================================================
// INITIALIZE ALL FORMS ON PAGE LOAD
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 Initializing Supabase forms...');
  
  // Initialize Supabase
  initSupabase();
  
  // Find all forms with sendCode class
  const forms = document.querySelectorAll('form.sendCode');
  console.log('📝 Found ' + forms.length + ' form(s)');
  
  forms.forEach((form, index) => {
    // Remove action attribute to prevent page redirect
    if (form.hasAttribute('action')) {
      form.removeAttribute('action');
    }
    
    // Attach submit handler
    form.addEventListener('submit', handleFormSubmission);
    console.log('✅ Form ' + (index + 1) + ' initialized');
  });
  
  console.log('✅ All forms ready!');
});

// =====================================================
// END OF SUPABASE CONFIGURATION
// =====================================================
