// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Sleep quality slider value display
    const qualitySliders = document.querySelectorAll('input[type="range"][name="sleep-quality"]');
    qualitySliders.forEach(slider => {
        const valueDisplay = slider.nextElementSibling.querySelector('span:not(:first-child):not(:last-child)');
        if (valueDisplay) {
            valueDisplay.textContent = slider.value;
            slider.addEventListener('input', function() {
                valueDisplay.textContent = this.value;
            });
        }
    });
    
    // Breathing exercise functionality
    const startBreathingButton = document.getElementById('start-breathing');
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingText = document.getElementById('breathing-text');
    
    if (startBreathingButton && breathingCircle && breathingText) {
        let isBreathing = false;
        let breathInterval;
        
        startBreathingButton.addEventListener('click', function() {
            if (!isBreathing) {
                isBreathing = true;
                startBreathingButton.textContent = 'Stop Exercise';
                
                let isInhale = true;
                breathingText.textContent = 'Breathe In';
                breathingCircle.style.animation = 'breathe-in 4s forwards';
                
                breathInterval = setInterval(() => {
                    isInhale = !isInhale;
                    if (isInhale) {
                        breathingText.textContent = 'Breathe In';
                        breathingCircle.style.animation = 'breathe-in 4s forwards';
                    } else {
                        breathingText.textContent = 'Breathe Out';
                        breathingCircle.style.animation = 'breathe-out 8s forwards';
                    }
                }, 8000);
            } else {
                isBreathing = false;
                startBreathingButton.textContent = 'Start Exercise';
                clearInterval(breathInterval);
                breathingCircle.style.animation = 'none';
                breathingText.textContent = 'Breathe In';
            }
        });
    }
    
    // Sleep tracker functionality
    const sleepLogForm = document.getElementById('sleep-log-form');
    if (sleepLogForm) {
        sleepLogForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const date = document.getElementById('sleep-date').value;
            const sleepTime = document.getElementById('sleep-time').value;
            const wakeTime = document.getElementById('wake-time').value;
            const quality = document.getElementById('sleep-quality').value;
            const notes = document.getElementById('sleep-notes').value;
            
            // Calculate duration
            const sleepDateTime = new Date(`${date}T${sleepTime}`);
            const wakeDateTime = new Date(`${date}T${wakeTime}`);
            
            // Handle overnight sleep (if wake time is next day)
            if (wakeDateTime < sleepDateTime) {
                wakeDateTime.setDate(wakeDateTime.getDate() + 1);
            }
            
            const durationMs = wakeDateTime - sleepDateTime;
            const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(1);
            
            // Save to localStorage
            const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs')) || [];
            sleepLogs.unshift({
                date,
                sleepTime,
                wakeTime,
                duration: durationHours,
                quality,
                notes
            });
            localStorage.setItem('sleepLogs', JSON.stringify(sleepLogs));
            
            // Update UI
            updateSleepStats();
            updateSleepHistory();
            
            // Reset form
            sleepLogForm.reset();
            document.getElementById('quality-value').textContent = '5';
            
            // Show success message
            alert('Sleep log saved successfully!');
        });
        
        // Initialize sleep tracker
        updateSleepStats();
        updateSleepHistory();
    }
    
    // Recommendations page functionality
    const editProfileButton = document.getElementById('edit-profile');
    if (editProfileButton) {
        editProfileButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
        
        // Load profile details from localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));
        const profileDetails = document.getElementById('profile-details');
        
        if (userData && profileDetails) {
            profileDetails.innerHTML = `
                <div>
                    <p class="text-sm text-gray-500">Age</p>
                    <p class="font-medium">${userData.age}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Preferred Wake-up Time</p>
                    <p class="font-medium">${userData.wakeTime}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Current Sleep Duration</p>
                    <p class="font-medium">${userData.sleepDuration} hours</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Sleep Quality</p>
                    <p class="font-medium">${userData.sleepQuality}/10</p>
                </div>
                <div class="md:col-span-2">
                    <p class="text-sm text-gray-500">Sleep Issues</p>
                    <p class="font-medium">${userData.issues.length > 0 ? userData.issues.join(', ') : 'None reported'}</p>
                </div>
            `;
        }
        
        // Load recommendations from localStorage
        const recommendationsContent = document.getElementById('recommendations-content');
        const recommendations = localStorage.getItem('recommendations');
        
        if (recommendations && recommendationsContent) {
            recommendationsContent.innerHTML = recommendations;
        }
    }
    
    // Sleep form submission
    const sleepForm = document.getElementById('sleep-form');
    if (sleepForm) {
        sleepForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading indicator
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Recommendations...
            `;
            submitButton.disabled = true;
            
            try {
                // Get form data
                const formData = new FormData(sleepForm);
                const userData = {
                    age: formData.get('age'),
                    wakeTime: formData.get('wake-time'),
                    sleepDuration: formData.get('sleep-duration'),
                    sleepQuality: formData.get('sleep-quality'),
                    issues: Array.from(formData.getAll('issues')),
                    additionalInfo: formData.get('additional-info')
                };
                
                // Save user data to localStorage
                localStorage.setItem('userData', JSON.stringify(userData));
                
                // Call AI API
                const response = await callAIAPI(userData);
                
                // Extract the text content from the response
                const recommendations = response.candidates[0].content.parts[0].text;
                
                // Remove any HTML tags from the response
                const cleanRecommendations = recommendations.replace(/```html\n?|\n?```/g, '').trim();
                
                // Save recommendations to localStorage
                localStorage.setItem('recommendations', cleanRecommendations);
                
                // Redirect to recommendations page
                window.location.href = 'recommendations.html';
            } catch (error) {
                console.error('Error generating recommendations:', error);
                alert('An error occurred while generating recommendations. Please try again.');
                
                // Reset button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
});

function updateSleepStats() {
    const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs')) || [];
    
    if (sleepLogs.length > 0) {
        // Calculate averages
        const totalDuration = sleepLogs.reduce((sum, log) => sum + parseFloat(log.duration), 0);
        const avgDuration = (totalDuration / sleepLogs.length).toFixed(1);
        
        const totalQuality = sleepLogs.reduce((sum, log) => sum + parseInt(log.quality), 0);
        const avgQuality = (totalQuality / sleepLogs.length).toFixed(1);
        
        // Update UI
        document.getElementById('avg-duration').textContent = `${avgDuration} hrs`;
        document.getElementById('avg-quality').textContent = `${avgQuality}/10`;
        document.getElementById('consistency').textContent = `${Math.min(100, Math.floor(avgDuration / 8 * 100))}%`;
        
        // Update chart
        updateSleepChart(sleepLogs.slice(0, 7)); // Show last 7 days
    }
}

function updateSleepHistory() {
    const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs')) || [];
    const sleepHistory = document.getElementById('sleep-history');
    
    if (sleepHistory) {
        if (sleepLogs.length > 0) {
            sleepHistory.innerHTML = sleepLogs.map(log => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">${log.date}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${log.sleepTime}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${log.wakeTime}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${log.duration} hrs</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-2">
                            <div class="h-2.5 bg-gray-200 rounded-full w-20">
                                <div class="h-2.5 bg-indigo-600 rounded-full transition-all duration-300" 
                                     style="width: ${(log.quality / 10) * 100}%"></div>
                            </div>
                            <span class="text-sm font-medium text-gray-700">${log.quality}/10</span>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
}

function updateSleepChart(logs) {
    const ctx = document.getElementById('sleep-chart');
    if (!ctx) return;
    
    // Prepare data
    const dates = logs.map(log => log.date);
    const durations = logs.map(log => parseFloat(log.duration));
    const qualities = logs.map(log => parseInt(log.quality));
    
    // Create or update chart
    if (window.sleepChart) {
        window.sleepChart.data.labels = dates;
        window.sleepChart.data.datasets[0].data = durations;
        window.sleepChart.data.datasets[1].data = qualities;
        window.sleepChart.update();
    } else {
        window.sleepChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Sleep Duration (hours)',
                        data: durations,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Sleep Quality (1-10)',
                        data: qualities,
                        borderColor: '#7c3aed',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 1,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Quality'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
}

// Function to call the Gemini AI API
async function callAIAPI(userData) {
    // API endpoint and key for Gemini API
    const API_KEY = 'AIzaSyBwIS2Khu5iitYy3nRQcVVqM0usugiIiuY';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    // Create a prompt for the AI
    const prompt = createAIPrompt(userData);
    
    // Make the API request
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
        })
    });
    
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
}

// Function to create a prompt for the AI based on user data
function createAIPrompt(userData) {
    // Format selected issues
    const issuesText = userData.issues.length > 0 
        ? `The user reported the following sleep issues: ${userData.issues.join(', ')}.` 
        : "The user didn't report any specific sleep issues.";
    
    // Additional information
    const additionalInfoText = userData.additionalInfo 
        ? `Additional information from the user: "${userData.additionalInfo}"` 
        : "";
    
    // Create the prompt
    return `
        I need personalized sleep recommendations for a user with the following profile:
        
        Age: ${userData.age}
        Preferred wake-up time: ${userData.wakeTime}
        Current average sleep duration: ${userData.sleepDuration} hours
        Current sleep quality rating: ${userData.sleepQuality}/10
        ${issuesText}
        ${additionalInfoText}
        
        Please provide a concise, interactive response (max 600 words) that includes:
        1. A personalized bedtime recommendation
        2. One key tip to address their main sleep issue
        3. A quick relaxation technique
        
        Format your response in HTML with the following structure:
        <div class="space-y-4">
            <div class="bg-indigo-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 class="text-indigo-800 font-semibold mb-2">Your Personalized Bedtime</h3>
                <p class="text-gray-700">[Bedtime recommendation]</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 class="text-purple-800 font-semibold mb-2">Quick Tip</h3>
                <p class="text-gray-700">[Key sleep improvement tip]</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 class="text-blue-800 font-semibold mb-2">Try This Tonight</h3>
                <p class="text-gray-700">[Relaxation technique]</p>
            </div>
        </div>
        
        Keep the response engaging and easy to read. Use friendly, conversational language.
    `;
}

// Update the sleep quality bar styling in the recommendations page
function updateRecommendationsQualityBar(quality) {
    const qualityBar = document.getElementById('quality-bar');
    if (qualityBar) {
        qualityBar.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="h-2.5 bg-gray-200 rounded-full w-20">
                    <div class="h-2.5 bg-indigo-600 rounded-full transition-all duration-300" 
                         style="width: ${(quality / 10) * 100}%"></div>
                </div>
                <span class="text-sm font-medium text-gray-700">${quality}/10</span>
            </div>
        `;
    }
}
