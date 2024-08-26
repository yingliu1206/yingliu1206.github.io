document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
    const query = document.getElementById('query').value.toLowerCase().trim();
    const files = ['index.html', 'work.html', 'education.html', 'ctr_rate.html', 'healthcare_fraud.html', 'chatbot.html'];
    let results = [];


    // Use Promise.all to wait for all fetches to complete
    Promise.all(
        files.map(file => 
            fetch(file)
                .then(response => response.text())
                .then(data => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
                    const title = doc.querySelector('title').innerText;
                    const matchedSections = extractMatchingSections(doc.body, query, file);

                    if (matchedSections.length > 0) {
                        results.push({ file: file, title: title, sections: matchedSections });
                    }
                })
                .catch(error => console.error('Error fetching the file:', error))
        )
    ).then(() => {
        displayResults(results, query);
        toggleResultsVisibility(results.length > 0); // Show results section if there are results
    });
});

function toggleResultsVisibility(show) {
    const resultsContainer = document.getElementById('results');
    if (show) {
        resultsContainer.classList.add('has-results'); // Add the 'has-results' class to show
    } else {
        resultsContainer.classList.remove('has-results'); // Remove the 'has-results' class to hide
    }
}

function extractMatchingSections(body, query, file) {
    const sections = body.querySelectorAll('.major');
    let matchedSections = [];

    sections.forEach(section => {
        if (section.textContent.toLowerCase().includes(query)) {
            // Create a link to the section
            const id = section.previousElementSibling.getAttribute('id') || generateId();
            section.previousElementSibling.setAttribute('id', id);
            const titleElement = section.querySelector('h2, h3, h4');
            const sectionTitle = titleElement ? titleElement.textContent : 'Section';
            const paragraphs = Array.from(section.querySelectorAll('p')).slice(0, 2);

            const content = paragraphs.map(p => p.outerHTML).join(' ');

            matchedSections.push({ id: id, file: file, title: sectionTitle, content: content });
        }
    });

    return matchedSections;
}

function displayResults(results, query) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        resultsContainer.innerHTML = `<p>No results found for "${query}".</p>`;
        return;
    }

    results.forEach(result => {
        result.sections.forEach(section => {
            const sectionLi = document.createElement('li');
            sectionLi.classList.add('matched-section');
            sectionLi.style.fontSize = '1em'; // Change font size as needed
            sectionLi.innerHTML = `
                <a href="${section.file}#${section.id}" target="_blank">${result.title} - ${section.title}</a>
            `;
            resultsContainer.appendChild(sectionLi);
            resultsContainer.appendChild(document.createElement('br')); // Add empty line between results
        });
    });
}

function generateId() {
    return 'section-' + Math.random().toString(36).substr(2, 9);
}
