// tabs.js

let tabCount = 0;
let tabToDelete = null;

document.getElementById('addTabButton').addEventListener('click', function() {
    addTab();
});

function addTab(contentType) {
    tabCount++;

    const tabList = document.getElementById('tabList');
    const newTab = document.createElement('li');
    newTab.id = `tab-${tabCount}`;
    newTab.classList.add('tab-item');
    newTab.textContent = "New Tab"; // Default text

    const closeButton = document.createElement('button');
    closeButton.classList.add('close-btn');
    closeButton.innerHTML = "&times;"; // Unicode for "x"

    function attachCloseListener() {
        closeButton.addEventListener('click', function(event) {
            event.stopPropagation();

            const tabContent = document.getElementById(`tabContent-${tabCount}`);
            if (tabContent && tabContent.innerHTML.trim() !== "") {
                tabToDelete = { tab: newTab, content: tabContent }; // Set tab to delete
                showDeleteConfirmModal();
            } else {
                deleteTab(newTab, tabContent);
            }
        });
    }

    attachCloseListener(); // Attach the close listener initially

    newTab.appendChild(closeButton);

    // Make the tab editable on double-click
    newTab.addEventListener('dblclick', function() {
        newTab.contentEditable = "true";
        newTab.focus();
        const range = document.createRange();
        range.selectNodeContents(newTab);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Reattach the close button event listener after editing
        newTab.addEventListener('blur', function() {
            newTab.contentEditable = "false";
            newTab.appendChild(closeButton); // Ensure close button is reattached
            attachCloseListener(); // Reattach the listener after editing
        });

        // Handle the enter key to stop editing
        newTab.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                newTab.blur();
            }
        });
    });

    newTab.addEventListener('click', (function(tabId) {
        return function() {
            navigateToTab(tabId);
        };
    })(tabCount));

    tabList.appendChild(newTab);

    initializeTabContent(tabCount, contentType); // Initialize content after tab creation
    updateTutorialVisibility(); // Update tutorial visibility when a new tab is created
}

function deleteTab(tab, content) {
    tab.remove();
    if (content) {
        content.remove();
    }
    updateTutorialVisibility();

    const activeTab = document.querySelector('.tab-item.active');
    if (!activeTab && document.getElementById('tabList').firstChild) {
        navigateToTab(document.getElementById('tabList').firstChild.id.replace('tab-', ''));
    }

    updateTutorialVisibility(); // Show tutorial if no tabs remain
}

function initializeTabContent(tabId, contentType) {
    const tabContentContainer = document.getElementById('tabContentContainer');
    const newTabContent = document.createElement('div');
    newTabContent.classList.add('tabContent');
    newTabContent.id = `tabContent-${tabId}`;

    newTabContent.setAttribute('contenteditable', 'true');
    newTabContent.textContent = "Enter your notes here...";


    newTabContent.style.display = 'none';
    tabContentContainer.appendChild(newTabContent);

    navigateToTab(tabId);
}

function navigateToTab(tabId) {
    console.log(`Navigating to tab ${tabId}`);
    
    const allTabContents = document.querySelectorAll('.tabContent');
    allTabContents.forEach(tabContent => {
        tabContent.classList.remove('active');
        tabContent.style.display = 'none';
    });

    const allTabs = document.querySelectorAll('.tab-item');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });

    const activeTabContent = document.getElementById(`tabContent-${tabId}`);
    if (activeTabContent) {
        activeTabContent.classList.add('active');
        activeTabContent.style.display = 'block';
    } else {
        console.log(`Tab content for tab-${tabId} not found`);
    }

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) {
        activeTab.classList.add('active');
    } else {
        console.log(`Tab-${tabId} not found`);
    }
}

function addTabFromLoad(tabId, name, content) {
    const tabList = document.getElementById('tabList');
    const newTab = document.createElement('li');
    newTab.id = tabId;
    newTab.classList.add('tab-item');
    newTab.textContent = name;

    const closeButton = document.createElement('button');
    closeButton.classList.add('close-btn');
    closeButton.innerHTML = "&times;";

    closeButton.addEventListener('click', function(event) {
        event.stopPropagation();
        const tabContent = document.getElementById(tabId.replace('tab-', 'tabContent-'));
        deleteTab(newTab, tabContent);
    });

    // Make the tab editable on double-click
    newTab.addEventListener('dblclick', function() {
        newTab.contentEditable = "true";
        newTab.focus();
        const range = document.createRange();
        range.selectNodeContents(newTab);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        newTab.addEventListener('blur', function() {
            newTab.contentEditable = "false";
            newTab.appendChild(closeButton);
            attachCloseListener(); 
        });

        newTab.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                newTab.blur();
            }
        });
    });

    newTab.addEventListener('click', function() {
        navigateToTab(tabId.replace('tab-', ''));
    });

    newTab.appendChild(closeButton);
    tabList.appendChild(newTab);

    const tabContentContainer = document.getElementById('tabContentContainer');
    const newTabContent = document.createElement('div');
    newTabContent.classList.add('tabContent');
    newTabContent.id = tabId.replace('tab-', 'tabContent-');

    // Set the content and ensure it is editable
    newTabContent.innerHTML = content;
    newTabContent.setAttribute('contenteditable', 'true');

    tabContentContainer.appendChild(newTabContent);

    // Make sure the loaded tab count matches the highest number used in the loaded project
    const loadedTabNumber = parseInt(tabId.replace('tab-', ''));
    if (loadedTabNumber >= tabCount) {
        tabCount = loadedTabNumber + 1;
    }
}

//util 
// utils.js

function showContentModal() {
    const modal = document.getElementById('contentModal');
    modal.style.display = "block";

    const options = document.querySelectorAll('.content-option');
    options.forEach(option => {
        option.onclick = function() {
            const contentType = this.getAttribute('data-type');

            if (contentType === "cancel") {
                modal.style.display = "none"; // Close the modal
                return; // Exit the function early, no tab will be created
            }

            addTab(contentType); // Create the tab only after a valid content type is selected
            modal.style.display = "none"; // Hide modal after selection
        };
    });
}

function showDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = "block";

    const confirmButton = document.getElementById('confirmDeleteButton');
    const cancelButton = document.getElementById('cancelDeleteButton');

    // Remove previous event listeners
    confirmButton.onclick = null;
    cancelButton.onclick = null;

    confirmButton.onclick = function() {
        modal.style.display = "none"; // Hide the modal after deleting
        if (tabToDelete) {
            deleteTab(tabToDelete.tab, tabToDelete.content);
            tabToDelete = null; // Reset
        }
    };

    cancelButton.onclick = function() {
        modal.style.display = "none"; // Just hide the modal
        tabToDelete = null; // Reset
    };
}

function updateTutorialVisibility() {
    const tabList = document.getElementById('tabList');
    const tutorialSection = document.getElementById('tutorialSection');
    
    if (tabList.children.length === 0) {
        tutorialSection.style.display = "block"; // Show the tutorial
    } else {
        tutorialSection.style.display = "none"; // Hide the tutorial
    }
}

// Handle paste events (for image handling)
function handlePasteEvent(event) {
    const items = event.clipboardData.items;
    for (let item of items) {
        if (item.type.indexOf("image") !== -1) {
            const blob = item.getAsFile();
            const reader = new FileReader();

            reader.onload = function(event) {
                const img = document.createElement("img");
                img.src = event.target.result;
                img.style.maxWidth = "100%"; // Ensure the image fits within the tab
                img.style.height = "auto";
                
                // Insert the image at the caret position
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.insertNode(img);
                    range.collapse(false);
                }
            };

            reader.readAsDataURL(blob);
            event.preventDefault(); // Prevent the default paste behavior
        }
    }
}

// Event listener to check tutorial visibility on page load
window.onload = function() {
    updateTutorialVisibility();
};

function loadProject(projectName) {
    console.log(`Loading project: ${projectName}`);
    const savedTabs = JSON.parse(localStorage.getItem(`project-${projectName}`));
    
    if (savedTabs) {
        savedTabs.forEach(tab => {
            console.log(`Loading tab: ${tab.name}`);
            addTabFromLoad(tab.id, tab.name, tab.content);
        });
    } else {
        console.error(`No tabs found for project: ${projectName}`);
    }
}
