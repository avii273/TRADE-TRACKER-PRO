// DOM Elements
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const closeSlider = document.getElementById('closeSlider');
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const dateLabel = document.getElementById('dateLabel');
const timeLabel = document.getElementById('timeLabel');
const plStatusRadios = document.querySelectorAll('input[name="plStatus"]');
const plAmountInput = document.getElementById('plAmount');
const previewModal = document.getElementById('previewModal');
const closePreviewModal = document.getElementById('closePreviewModal');
const addTradeBtn = document.getElementById('addTradeBtn');
const searchInput = document.getElementById('searchInput');
const dateFilter = document.getElementById('dateFilter');
const filterBtns = document.querySelectorAll('.filter-btn');
const historyGrid = document.getElementById('historyGrid');
const favoritesGrid = document.getElementById('favoritesGrid');
const recycleGrid = document.getElementById('recycleGrid');
const modalBody = document.getElementById('modalBody');
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const editModalBody = document.getElementById('editModalBody');
const imageUploads = document.querySelectorAll('.upload-box');
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

// Initialize data
let trades = JSON.parse(localStorage.getItem('trades')) || [];
let deletedTrades = JSON.parse(localStorage.getItem('deletedTrades')) || [];
let activeFilter = 'all';

// Set current date and time
const now = new Date();
const formattedDate = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});
const formattedTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
});

// Initialize form
dateLabel.textContent = `📆 ${formattedDate}`;
timeLabel.textContent = `🕒 ${formattedTime}`;

// Hamburger menu toggle
hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// Close sidebar when slider is clicked
closeSlider.addEventListener('click', () => {
    sidebar.classList.remove('open');
});

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all items
        navItems.forEach(navItem => {
            navItem.classList.remove('active');
        });
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the selected section
        const sectionId = item.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
        
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
            sidebar.classList.remove('open');
        }
        
        // Update data when switching to portfolio
        if (sectionId === 'portfolio') {
            updatePortfolioStats();
        }
    });
});

// Profit/Loss status change
plStatusRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'running') {
            plAmountInput.disabled = true;
            plAmountInput.classList.remove('profit', 'loss');
        } else {
            plAmountInput.disabled = false;
            plAmountInput.classList.remove('profit', 'loss');
            plAmountInput.classList.add(radio.value);
        }
    });
});

// Date picker functionality
dateInput.addEventListener('change', (e) => {
    const selectedDate = new Date(e.target.value);
    const formattedDate = selectedDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    dateLabel.textContent = `📆 ${formattedDate}`;
});

// Time picker functionality
timeInput.addEventListener('change', (e) => {
    const [hours, minutes] = e.target.value.split(':');
    const time = new Date();
    time.setHours(hours, minutes);
    const formattedTime = time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    timeLabel.textContent = `🕒 ${formattedTime}`;
});

// Preview modal
function openPreviewModal(trade) {
    modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <div class="detail-label">Coin Name</div>
                <div class="detail-value">${trade.coin}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Date</div>
                <div class="detail-value">${trade.date}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Time</div>
                <div class="detail-value">${trade.time}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Margin</div>
                <div class="detail-value">$${trade.margin.toFixed(2)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Position</div>
                <div class="detail-value">${trade.tradeType === 'long' ? 'Long' : 'Short'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Entry Price</div>
                <div class="detail-value">$${trade.entryPrice.toFixed(4)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Exit Price</div>
                <div class="detail-value">${trade.exitPrice ? `$${trade.exitPrice.toFixed(4)}` : 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                    <span class="pl-amount ${trade.plStatus}">
                        ${trade.plStatus === 'running' ? 'Still Running' : (trade.plStatus === 'profit' ? `Profit: $${trade.plAmount.toFixed(2)}` : `Loss: $${trade.plAmount.toFixed(2)}`)}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="detail-note">
            <div class="detail-label">Note</div>
            <div class="detail-value">${trade.note || 'No notes for this trade'}</div>
        </div>
        
        <div class="preview-images">
            ${trade.images && trade.images.length > 0 ? 
                trade.images.map(img => `<div class="preview-image"><img src="${img}" alt="Trade image"></div>`).join('') 
                : '<div class="preview-image"><i class="fas fa-image"></i></div>'}
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn btn-primary" id="editFromPreview" style="width: 100%;">
                <i class="fas fa-edit"></i> Edit Trade
            </button>
        </div>
    `;
    
    // Add edit button functionality
    document.getElementById('editFromPreview').addEventListener('click', () => {
        previewModal.classList.remove('open');
        openEditModal(trade);
    });
    
    previewModal.classList.add('open');
}

closePreviewModal.addEventListener('click', () => {
    previewModal.classList.remove('open');
});

// Edit modal
function openEditModal(trade) {
    const tradeIndex = trades.findIndex(t => t.id === trade.id);
    
    editModalBody.innerHTML = `
        <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" class="form-control" id="editDate" value="${new Date(trade.date).toISOString().split('T')[0]}">
            <div class="form-control" id="editDateLabel" style="margin-top: 10px; background: var(--bg);">${trade.date}</div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Time</label>
            <input type="time" class="form-control" id="editTime" value="${trade.time.replace('🕒 ', '')}">
            <div class="form-control" id="editTimeLabel" style="margin-top: 10px; background: var(--bg);">${trade.time}</div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Coin Name</label>
            <input type="text" class="form-control" id="editCoinName" value="${trade.coin}">
        </div>
        
        <div class="form-group">
            <label class="form-label">Margin ($)</label>
            <input type="number" class="form-control" id="editMargin" value="${trade.margin}">
        </div>
        
        <div class="form-group">
            <label class="form-label">Long/Short</label>
            <div class="radio-group">
                <label class="radio-option">
                    <input type="radio" name="editTradeType" value="long" ${trade.tradeType === 'long' ? 'checked' : ''}>
                    <span class="custom-radio"></span>
                    Long
                </label>
                <label class="radio-option">
                    <input type="radio" name="editTradeType" value="short" ${trade.tradeType === 'short' ? 'checked' : ''}>
                    <span class="custom-radio"></span>
                    Short
                </label>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Entry Price</label>
            <input type="number" class="form-control" id="editEntryPrice" value="${trade.entryPrice}" step="0.0001">
        </div>
        
        <div class="form-group">
            <label class="form-label">Exit Price</label>
            <input type="number" class="form-control" id="editExitPrice" value="${trade.exitPrice}" step="0.0001">
        </div>
        
        <div class="form-group">
            <label class="form-label">Profit/Loss/Still Running</label>
            <div class="radio-group">
                <label class="radio-option">
                    <input type="radio" name="editPlStatus" value="profit" ${trade.plStatus === 'profit' ? 'checked' : ''}>
                    <span class="custom-radio"></span>
                    Profit
                </label>
                <label class="radio-option">
                    <input type="radio" name="editPlStatus" value="loss" ${trade.plStatus === 'loss' ? 'checked' : ''}>
                    <span class="custom-radio"></span>
                    Loss
                </label>
                <label class="radio-option">
                    <input type="radio" name="editPlStatus" value="running" ${trade.plStatus === 'running' ? 'checked' : ''}>
                    <span class="custom-radio"></span>
                    Still Running
                </label>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Profit/Loss Amount ($)</label>
            <input type="number" class="form-control ${trade.plStatus}" id="editPlAmount" value="${trade.plAmount}" ${trade.plStatus === 'running' ? 'disabled' : ''}>
        </div>
        
        <div class="form-group">
            <label class="form-label">Note</label>
            <textarea class="form-control" id="editTradeNote">${trade.note || ''}</textarea>
        </div>
        
        <button class="btn btn-primary" id="saveEditBtn">
            <i class="fas fa-save"></i> Save Changes
        </button>
    `;
    
    // Add change listeners for edit form
    document.querySelectorAll('input[name="editPlStatus"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const plAmountInput = document.getElementById('editPlAmount');
            if (radio.value === 'running') {
                plAmountInput.disabled = true;
                plAmountInput.classList.remove('profit', 'loss');
            } else {
                plAmountInput.disabled = false;
                plAmountInput.classList.remove('profit', 'loss');
                plAmountInput.classList.add(radio.value);
            }
        });
    });
    
    document.getElementById('editDate').addEventListener('change', (e) => {
        const selectedDate = new Date(e.target.value);
        const formattedDate = selectedDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        document.getElementById('editDateLabel').textContent = `📆 ${formattedDate}`;
    });
    
    document.getElementById('editTime').addEventListener('change', (e) => {
        const [hours, minutes] = e.target.value.split(':');
        const time = new Date();
        time.setHours(hours, minutes);
        const formattedTime = time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('editTimeLabel').textContent = `🕒 ${formattedTime}`;
    });
    
    // Save edit button
    document.getElementById('saveEditBtn').addEventListener('click', () => {
        trades[tradeIndex].date = document.getElementById('editDateLabel').textContent;
        trades[tradeIndex].time = document.getElementById('editTimeLabel').textContent;
        trades[tradeIndex].coin = document.getElementById('editCoinName').value;
        trades[tradeIndex].margin = parseFloat(document.getElementById('editMargin').value) || 0;
        trades[tradeIndex].tradeType = document.querySelector('input[name="editTradeType"]:checked').value;
        trades[tradeIndex].entryPrice = parseFloat(document.getElementById('editEntryPrice').value) || 0;
        trades[tradeIndex].exitPrice = parseFloat(document.getElementById('editExitPrice').value) || 0;
        trades[tradeIndex].plStatus = document.querySelector('input[name="editPlStatus"]:checked').value;
        trades[tradeIndex].plAmount = parseFloat(document.getElementById('editPlAmount').value) || 0;
        trades[tradeIndex].note = document.getElementById('editTradeNote').value;
        
        localStorage.setItem('trades', JSON.stringify(trades));
        
        editModal.classList.remove('open');
        renderTrades();
        updatePortfolioStats();
        
        // Show success message
        alert('Trade updated successfully!');
    });
    
    editModal.classList.add('open');
}

closeEditModal.addEventListener('click', () => {
    editModal.classList.remove('open');
});

// Image upload
imageUploads.forEach((uploadBox, index) => {
    const fileInput = uploadBox.querySelector('input[type="file"]');
    
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadBox.innerHTML = `<img src="${event.target.result}" alt="Uploaded image">`;
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });
});

// Add trade button with validation
addTradeBtn.addEventListener('click', () => {
    // Validate required fields
    if (!dateInput.value) {
        alert('Please select a date');
        return;
    }
    if (!timeInput.value) {
        alert('Please select a time');
        return;
    }
    
    const coinName = document.getElementById('coinName').value;
    if (!coinName) {
        alert('Please enter a coin name');
        return;
    }
    
    const margin = parseFloat(document.getElementById('margin').value);
    if (isNaN(margin)) {
        alert('Please enter a valid margin amount');
        return;
    }
    
    const entryPrice = parseFloat(document.getElementById('entryPrice').value);
    if (isNaN(entryPrice)) {
        alert('Please enter a valid entry price');
        return;
    }
    
    const exitPrice = parseFloat(document.getElementById('exitPrice').value);
    if (isNaN(exitPrice)) {
        alert('Please enter a valid exit price');
        return;
    }
    
    const plStatus = document.querySelector('input[name="plStatus"]:checked').value;
    let plAmount = 0;
    if (plStatus !== 'running') {
        plAmount = parseFloat(document.getElementById('plAmount').value);
        if (isNaN(plAmount)) {
            alert('Please enter a valid profit/loss amount');
            return;
        }
    }
    
    const trade = {
        id: Date.now(),
        coin: coinName,
        date: dateLabel.textContent,
        time: timeLabel.textContent,
        margin: margin,
        tradeType: document.querySelector('input[name="tradeType"]:checked').value,
        entryPrice: entryPrice,
        exitPrice: exitPrice,
        plStatus: plStatus,
        plAmount: plAmount,
        note: document.getElementById('tradeNote').value,
        favorite: false,
        images: []
    };
    
    // Get uploaded images
    document.querySelectorAll('.upload-box img').forEach(img => {
        if (img.src) trade.images.push(img.src);
    });
    
    // Add to trades
    trades.push(trade);
    localStorage.setItem('trades', JSON.stringify(trades));
    
    // Reset form
    document.getElementById('coinName').value = '';
    document.getElementById('margin').value = '';
    document.getElementById('entryPrice').value = '';
    document.getElementById('exitPrice').value = '';
    document.getElementById('plAmount').value = '';
    document.getElementById('tradeNote').value = '';
    document.querySelectorAll('.upload-box').forEach(box => {
        box.innerHTML = '<i class="fas fa-plus"></i>';
        box.querySelector('input[type="file"]').value = '';
    });
    
    // Clear date/time inputs but keep labels
    dateInput.value = '';
    timeInput.value = '';
    
    // Show success message
    alert('Trade added successfully!');
    
    // Switch to history section
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === 'history') {
            item.classList.add('active');
        }
    });
    
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('history').classList.add('active');
    
    // Refresh history view
    renderTrades();
    updatePortfolioStats();
});

// Filter trades
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderTrades();
    });
});

// Search trades
searchInput.addEventListener('input', renderTrades);

// Filter by date
dateFilter.addEventListener('change', renderTrades);

// Render trades
function renderTrades() {
    // Clear grids
    historyGrid.innerHTML = '';
    favoritesGrid.innerHTML = '';
    recycleGrid.innerHTML = '';

    // Filter trades based on active filter and search
    const searchTerm = searchInput.value.toLowerCase();
    const filterDate = dateFilter.value;
    
    const filteredTrades = trades.filter(trade => {
        const matchesSearch = trade.coin.toLowerCase().includes(searchTerm) || 
                            trade.plStatus.includes(searchTerm) || 
                            trade.plAmount.toString().includes(searchTerm);
        
        const matchesFilter = activeFilter === 'all' || 
                            (activeFilter === 'profit' && trade.plStatus === 'profit') ||
                            (activeFilter === 'loss' && trade.plStatus === 'loss') ||
                            (activeFilter === 'running' && trade.plStatus === 'running');
        
        const matchesDate = !filterDate || new Date(trade.date.split('📆 ')[1]).toISOString().split('T')[0] === filterDate;
        
        return matchesSearch && matchesFilter && matchesDate;
    });
    
    // Add to history grid
    filteredTrades.forEach(trade => {
        historyGrid.appendChild(createTradeCard(trade));
    });
    
    // Add to favorites grid
    trades.filter(trade => trade.favorite).forEach(trade => {
        favoritesGrid.appendChild(createTradeCard(trade));
    });
    
    // Add to recycle bin
    deletedTrades.forEach(trade => {
        recycleGrid.appendChild(createDeletedTradeCard(trade));
    });
}

// Create trade card
function createTradeCard(trade) {
    const card = document.createElement('div');
    card.className = `trade-card ${trade.plStatus}`;
    card.dataset.id = trade.id;
    
    card.innerHTML = `
        ${trade.favorite ? '<div class="favorite-star"><i class="fas fa-star"></i></div>' : ''}
        <div class="trade-header">
            <div class="trade-coin">${trade.coin}</div>
            <div class="pl-amount ${trade.plStatus}">
                ${trade.plStatus === 'running' ? 'Running' : (trade.plStatus === 'profit' ? `+$${trade.plAmount.toFixed(2)}` : `-$${Math.abs(trade.plAmount).toFixed(2)}`)}
            </div>
        </div>
        <div class="trade-date">${trade.date.split('📆 ')[1]}</div>
        <div class="kebab-menu">
            ⋮
            <div class="kebab-options">
                <div class="kebab-option" data-action="preview">
                    <i class="fas fa-eye"></i> Preview
                </div>
                <div class="kebab-option" data-action="delete">
                    <i class="fas fa-trash"></i> Delete
                </div>
                <div class="kebab-option" data-action="edit">
                    <i class="fas fa-edit"></i> Edit
                </div>
                <div class="kebab-option" data-action="favorite">
                    <i class="fas fa-star"></i> ${trade.favorite ? 'Unfavorite' : 'Favorite'}
                </div>
            </div>
        </div>
    `;
    
    // Add kebab menu functionality
    const kebabMenu = card.querySelector('.kebab-menu');
    kebabMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        const options = card.querySelector('.kebab-options');
        options.classList.toggle('open');
    });
    
    // Add option click handlers
    const options = card.querySelectorAll('.kebab-option');
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = option.getAttribute('data-action');
            const tradeId = parseInt(card.dataset.id);
            const tradeIndex = trades.findIndex(t => t.id === tradeId);
            
            switch(action) {
                case 'preview':
                    openPreviewModal(trades[tradeIndex]);
                    break;
                case 'delete':
                    // Move to recycle bin
                    deletedTrades.push(trades[tradeIndex]);
                    localStorage.setItem('deletedTrades', JSON.stringify(deletedTrades));
                    
                    // Remove from trades
                    trades.splice(tradeIndex, 1);
                    localStorage.setItem('trades', JSON.stringify(trades));
                    
                    // Refresh view
                    renderTrades();
                    updatePortfolioStats();
                    break;
                case 'edit':
                    openEditModal(trades[tradeIndex]);
                    break;
                case 'favorite':
                    trades[tradeIndex].favorite = !trades[tradeIndex].favorite;
                    localStorage.setItem('trades', JSON.stringify(trades));
                    renderTrades();
                    break;
            }
            
            card.querySelector('.kebab-options').classList.remove('open');
        });
    });
    
    // Close kebab menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!card.contains(e.target)) {
            const options = card.querySelector('.kebab-options');
            if (options) options.classList.remove('open');
        }
    });
    
    return card;
}

// Create deleted trade card
function createDeletedTradeCard(trade) {
    const card = document.createElement('div');
    card.className = `trade-card ${trade.plStatus}`;
    card.dataset.id = trade.id;
    
    card.innerHTML = `
        <div class="trade-header">
            <div class="trade-coin">${trade.coin}</div>
            <div class="pl-amount ${trade.plStatus}">
                ${trade.plStatus === 'running' ? 'Running' : (trade.plStatus === 'profit' ? `+$${trade.plAmount.toFixed(2)}` : `-$${Math.abs(trade.plAmount).toFixed(2)}`)}
            </div>
        </div>
        <div class="trade-date">${trade.date.split('📆 ')[1]}</div>
        <div class="kebab-menu">
            ⋮
            <div class="kebab-options">
                <div class="kebab-option" data-action="restore">
                    <i class="fas fa-undo"></i> Restore
                </div>
                <div class="kebab-option" data-action="delete-permanent">
                    <i class="fas fa-trash"></i> Delete Permanent
                </div>
            </div>
        </div>
    `;
    
    // Add kebab menu functionality
    const kebabMenu = card.querySelector('.kebab-menu');
    kebabMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        const options = card.querySelector('.kebab-options');
        options.classList.toggle('open');
    });
    
    // Add option click handlers
    const options = card.querySelectorAll('.kebab-option');
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = option.getAttribute('data-action');
            const tradeId = parseInt(card.dataset.id);
            const tradeIndex = deletedTrades.findIndex(t => t.id === tradeId);
            
            switch(action) {
                case 'restore':
                    // Move back to trades
                    trades.push(deletedTrades[tradeIndex]);
                    localStorage.setItem('trades', JSON.stringify(trades));
                    
                    // Remove from deleted trades
                    deletedTrades.splice(tradeIndex, 1);
                    localStorage.setItem('deletedTrades', JSON.stringify(deletedTrades));
                    
                    // Refresh view
                    renderTrades();
                    updatePortfolioStats();
                    break;
                case 'delete-permanent':
                    // Remove permanently
                    deletedTrades.splice(tradeIndex, 1);
                    localStorage.setItem('deletedTrades', JSON.stringify(deletedTrades));
                    
                    // Refresh view
                    renderTrades();
                    break;
            }
            
            card.querySelector('.kebab-options').classList.remove('open');
        });
    });
    
    return card;
}

// Update portfolio stats
function updatePortfolioStats() {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.plStatus === 'profit').length;
    const losingTrades = trades.filter(t => t.plStatus === 'loss').length;
    const runningTrades = trades.filter(t => t.plStatus === 'running').length;
    
    const totalProfit = trades.filter(t => t.plStatus === 'profit').reduce((sum, t) => sum + t.plAmount, 0);
    const totalLoss = trades.filter(t => t.plStatus === 'loss').reduce((sum, t) => sum + Math.abs(t.plAmount), 0);
    const runningValue = trades.filter(t => t.plStatus === 'running').reduce((sum, t) => sum + t.plAmount, 0);
    
    const winningPercent = totalTrades ? Math.round((winningTrades / totalTrades) * 100) : 0;
    const losingPercent = totalTrades ? Math.round((losingTrades / totalTrades) * 100) : 0;
    const avgProfit = winningTrades ? (totalProfit / winningTrades).toFixed(2) : 0;
    const avgLoss = losingTrades ? (totalLoss / losingTrades).toFixed(2) : 0;
    const netProfit = totalProfit - totalLoss;
    const profitFactor = totalLoss ? (totalProfit / totalLoss).toFixed(2) : totalProfit ? '∞' : 0;
    
    // Update DOM
    document.getElementById('totalTrades').textContent = totalTrades;
    document.getElementById('winningTrades').textContent = winningTrades;
    document.getElementById('losingTrades').textContent = losingTrades;
    document.getElementById('runningTrades').textContent = `${runningTrades} trade${runningTrades !== 1 ? 's' : ''}`;
    
    document.getElementById('winningPercent').textContent = `${winningPercent}% of all trades`;
    document.getElementById('losingPercent').textContent = `${losingPercent}% of all trades`;
    
    document.getElementById('winningProgress').style.width = `${winningPercent}%`;
    document.getElementById('losingProgress').style.width = `${losingPercent}%`;
    
    document.getElementById('totalProfit').textContent = `$${totalProfit.toFixed(2)}`;
    document.getElementById('totalLoss').textContent = `$${totalLoss.toFixed(2)}`;
    document.getElementById('netProfit').textContent = `$${netProfit.toFixed(2)}`;
    document.getElementById('netProfit').className = `stat-value ${netProfit >= 0 ? 'profit' : 'loss'}`;
    
    document.getElementById('avgProfit').textContent = `Average profit: $${avgProfit}`;
    document.getElementById('avgLoss').textContent = `Average loss: $${avgLoss}`;
    document.getElementById('profitFactor').textContent = `Profit factor: ${profitFactor}`;
    document.getElementById('runningValue').textContent = `Current value: $${runningValue.toFixed(2)}`;
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    
    const themeIcon = document.querySelector('#themeToggle i, #mobileThemeToggle i');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.className = 'fas fa-sun';
        document.querySelector('#themeToggle span').textContent = 'Light Mode';
    } else {
        themeIcon.className = 'fas fa-moon';
        document.querySelector('#themeToggle span').textContent = 'Dark Mode';
    }
}

themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', toggleTheme);

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('#themeToggle i').className = 'fas fa-sun';
        document.querySelector('#themeToggle span').textContent = 'Light Mode';
        document.querySelector('#mobileThemeToggle i').className = 'fas fa-sun';
    }
    
    // Add sample data for demo
    if (trades.length === 0) {
        trades = [
            {
                id: 1,
                coin: "Bitcoin",
                date: "📆 July 1, 2025",
                time: "🕒 10:30 AM",
                margin: 1000,
                tradeType: "long",
                entryPrice: 61000,
                exitPrice: 62000,
                plStatus: "profit",
                plAmount: 200,
                note: "Breakout above resistance",
                favorite: true,
                images: []
            },
            {
                id: 2,
                coin: "Ethereum",
                date: "📆 July 2, 2025",
                time: "🕒 2:15 PM",
                margin: 800,
                tradeType: "short",
                entryPrice: 3500,
                exitPrice: 3400,
                plStatus: "profit",
                plAmount: 150,
                note: "Rejection at resistance level",
                favorite: false,
                images: []
            }
        ];
        localStorage.setItem('trades', JSON.stringify(trades));
    }
    
    renderTrades();
    updatePortfolioStats();
});
