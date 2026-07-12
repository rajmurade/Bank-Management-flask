/**
 * Apex Bank Frontend Engine
 * Asynchronous Fetch Integration with Flask backend routing structure
 */

document.addEventListener('DOMContentLoaded', () => {
    initModalManagement();
    initDynamicFormInputs();
    initFormValidation();
});

/* ==================== MODAL WINDOWS MANAGEMENT ==================== */
function initModalManagement() {
    const actionCards = document.querySelectorAll('.action-card');
    const closeButtons = document.querySelectorAll('.close-btn');
    const modalOverlays = document.querySelectorAll('.modal-overlay');

    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const modalId = card.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                const firstInput = targetModal.querySelector('input');
                if (firstInput) firstInput.focus();
            }
        });
    });

    const dismissModals = () => {
        modalOverlays.forEach(modal => {
            modal.classList.remove('active');
            const form = modal.querySelector('form');
            if (form) resetFormState(form);
        });
        document.body.style.overflow = '';
    };

    closeButtons.forEach(btn => btn.addEventListener('click', dismissModals));
    
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) dismissModals();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dismissModals();
    });
}

/* ==================== REGISTER DYNAMIC CONFIGURATIONS ==================== */
function initDynamicFormInputs() {
    const radioGroup = document.querySelectorAll('input[name="update_field"]');
    const label = document.getElementById('dynamic-label');
    const input = document.getElementById('dynamic-input');

    radioGroup.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const selection = e.target.value;
            
            switch (selection) {
                case 'name':
                    label.textContent = 'New Name';
                    label.setAttribute('for', 'dynamic-input');
                    input.type = 'text';
                    input.placeholder = 'New Full Name';
                    input.removeAttribute('min');
                    input.removeAttribute('max');
                    break;
                case 'age':
                    label.textContent = 'New Age';
                    label.setAttribute('for', 'dynamic-input');
                    input.type = 'number';
                    input.placeholder = 'Min. 18';
                    input.min = '18';
                    input.max = '120';
                    break;
                case 'email':
                    label.textContent = 'New Email Address';
                    label.setAttribute('for', 'dynamic-input');
                    input.type = 'email';
                    input.placeholder = 'new.email@example.com';
                    input.removeAttribute('min');
                    input.removeAttribute('max');
                    break;
            }
            input.parentElement.classList.remove('invalid');
            const errMsg = input.parentElement.querySelector('.error-message');
            if (errMsg) errMsg.textContent = '';
            input.value = '';
        });
    });
}

/* ==================== FORM VALIDATION AND PROCESSING ==================== */
function initFormValidation() {
    const forms = document.querySelectorAll('.bank-form');

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (validateFormElements(form)) {
                await handleFormAction(form);
            }
        });

        form.querySelectorAll('input').forEach(field => {
            field.addEventListener('input', () => {
                const group = field.parentElement;
                if (group.classList.contains('invalid')) {
                    group.classList.remove('invalid');
                    const errMsg = group.querySelector('.error-message');
                    if (errMsg) errMsg.textContent = '';
                }
            });
        });
    });
}

function validateFormElements(form) {
    let hasValidationError = false;
    const fields = form.querySelectorAll('input[required]');

    fields.forEach(field => {
        const group = field.parentElement;
        const errorText = group.querySelector('.error-message') || document.getElementById('delete-checkbox-err');
        
        if (!field.value.trim()) {
            displayFieldError(group, errorText, 'Required parameter input.');
            hasValidationError = true;
        } else if (field.type === 'email' && !validateEmailFormat(field.value)) {
            displayFieldError(group, errorText, 'Enter a valid email address.');
            hasValidationError = true;
        } else if (field.getAttribute('pattern') && !new RegExp(field.pattern).test(field.value)) {
            displayFieldError(group, errorText, 'Invalid layout pattern.');
            hasValidationError = true;
        } else if (field.type === 'number') {
            const numericVal = parseFloat(field.value);
            const min = parseFloat(field.min);
            const max = parseFloat(field.max);

            if (!isNaN(min) && numericVal < min) {
                displayFieldError(group, errorText, `Minimum limit is ${min}.`);
                hasValidationError = true;
            } else if (!isNaN(max) && numericVal > max) {
                displayFieldError(group, errorText, `Maximum limit is ${max}.`);
                hasValidationError = true;
            }
        } else if (field.type === 'checkbox' && !field.checked) {
            displayFieldError(group, errorText, 'Authorization statement confirmation required.');
            hasValidationError = true;
        }
    });

    return !hasValidationError;
}

function displayFieldError(group, elementContainer, text) {
    group.classList.add('invalid');
    if (elementContainer) {
        elementContainer.textContent = text;
    }
}

function validateEmailFormat(email) {
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return rx.test(email);
}

function resetFormState(form) {
    form.reset();
    const groups = form.querySelectorAll('.form-group');
    groups.forEach(g => {
        g.classList.remove('invalid');
        const err = g.querySelector('.error-message');
        if (err) err.textContent = '';
    });
    
    const detailsDisplay = document.getElementById('details-result');
    if (detailsDisplay) detailsDisplay.classList.add('hidden');

    const checkErr = document.getElementById('delete-checkbox-err');
    if (checkErr) checkErr.textContent = '';
}

/* ==================== CORE ASYNC API CONTROLLERS ==================== */

async function handleFormAction(form) {
    const id = form.id;
    let payload = {};
    let endpoint = '';
    let method = 'POST';

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    // Build the payload matching backend parameters
    switch (id) {
        case 'create-form':
            endpoint = '/create-account';
            payload = {
                name: document.getElementById('create-name').value.trim(),
                age: parseInt(document.getElementById('create-age').value, 10),
                email: document.getElementById('create-email').value.trim(),
                pin: document.getElementById('create-pin').value
            };
            break;

        case 'deposit-form':
            endpoint = '/deposit';
            payload = {
                account_number: document.getElementById('deposit-account').value.trim(),
                pin: document.getElementById('deposit-pin').value,
                amount: parseFloat(document.getElementById('deposit-amount').value)
            };
            break;

        case 'withdraw-form':
            endpoint = '/withdraw';
            payload = {
                account_number: document.getElementById('withdraw-account').value.trim(),
                pin: document.getElementById('withdraw-pin').value,
                amount: parseFloat(document.getElementById('withdraw-amount').value)
            };
            break;

        case 'details-form':
            endpoint = '/details';
            payload = {
                account_number: document.getElementById('details-account').value.trim(),
                pin: document.getElementById('details-pin').value
            };
            break;

        case 'update-form':
            endpoint = '/update';
            method = 'PUT';
            const selectedField = form.querySelector('input[name="update_field"]:checked').value;
            const updatedValue = document.getElementById('dynamic-input').value.trim();
            payload = {
                account_number: document.getElementById('update-account').value.trim(),
                pin: document.getElementById('update-pin').value,
                field: selectedField,
                value: selectedField === 'age' ? parseInt(updatedValue, 10) : updatedValue
            };
            break;

        case 'delete-form':
            endpoint = '/delete';
            method = 'DELETE';
            payload = {
                account_number: document.getElementById('delete-account').value.trim(),
                pin: document.getElementById('delete-pin').value
            };
            break;
    }

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            handleApiResponse(id, data);
            
            // Clean up and dismiss modals automatically for transactional forms
            if (id !== 'details-form') {
                setTimeout(() => {
                    const overlay = form.closest('.modal-overlay');
                    if (overlay) {
                        overlay.classList.remove('active');
                        document.body.style.overflow = '';
                        resetFormState(form);
                    }
                }, 2000);
            }
        } else {
            triggerSystemFeedback(data.message || 'Processing error occurred.', 'error');
        }

    } catch (networkError) {
        triggerSystemFeedback('Database connection failure. Core network not found.', 'error');
        console.error('System Error:', networkError);
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

function handleApiResponse(formId, response) {
    if (formId === 'details-form') {
        const record = response.data;
        const outBox = document.getElementById('details-result');
        
        document.getElementById('res-acc').textContent = record.account_number || 'N/A';
        document.getElementById('res-name').textContent = record.name || 'N/A';
        document.getElementById('res-email').textContent = record.email || 'N/A';
        document.getElementById('res-age').textContent = record.age || 'N/A';
        document.getElementById('res-bal').textContent = `$${parseFloat(record.balance || 0).toFixed(2)}`;
        
        outBox.classList.remove('hidden');
        triggerSystemFeedback(response.message || 'Records retrieved.', 'success');
    } else {
        triggerSystemFeedback(response.message || 'Command executed.', 'success');
    }
}

function triggerSystemFeedback(text, type = 'success') {
    const statusPanel = document.getElementById('status-panel');
    const statusMessage = document.getElementById('status-message');

    statusPanel.className = `status-panel ${type}`;
    statusMessage.textContent = text;
    statusPanel.classList.remove('hidden');

    setTimeout(() => {
        statusPanel.classList.add('hidden');
    }, 5000);
}