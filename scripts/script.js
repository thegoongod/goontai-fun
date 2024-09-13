let grid;
let videos = [];
let allTags = new Set();
let activeTags = new Set();

document.addEventListener('DOMContentLoaded', function() {
    grid = new Muuri('.grid', {
        dragEnabled: true,
        layoutOnInit: false,
        dragStartPredicate: {
            handle: '.item-content'
        }
    });

    grid.layout();

    document.getElementById('addVideoBtn').addEventListener('click', addVideo);
    document.getElementById('tagSearch').addEventListener('input', filterTags);

    // Add event listener for keydown events
    document.addEventListener('keydown', handleKeyPress);

    fetchVideos();
});

function handleKeyPress(event) {
    if (event.key === 'g') {
        addVideo();
    } 
}

async function fetchVideos() {
    try {
        const response = await fetch('videos.json');
        videos = await response.json();
        console.log('Fetched videos:', videos);
        updateTagList();
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

function updateTagList() {
    const tagList = document.getElementById('tagList');
    allTags = new Set(videos.flatMap(video => Array.isArray(video.tags) ? video.tags : video.tags.split(',').map(tag => tag.trim())));
    
    tagList.innerHTML = '';
    allTags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => toggleTag(tag, tagElement));
        tagList.appendChild(tagElement);
    });
}

function toggleTag(tag, element) {
    if (activeTags.has(tag)) {
        activeTags.delete(tag);
        element.classList.remove('active');
    } else {
        activeTags.add(tag);
        element.classList.add('active');
    }
}

function filterTags() {
    const searchTerm = document.getElementById('tagSearch').value.toLowerCase();
    const tagElements = document.querySelectorAll('#tagList .tag');
    tagElements.forEach(tagElement => {
        const tag = tagElement.textContent.toLowerCase();
        tagElement.style.display = tag.includes(searchTerm) ? '' : 'none';
    });
}

function addVideo() {
    if (videos.length === 0) {
        console.log('No videos available');
        return;
    }

    const filteredVideos = activeTags.size === 0 ? videos : videos.filter(video => {
        const videoTags = Array.isArray(video.tags) ? video.tags : video.tags.split(',').map(tag => tag.trim());
        return videoTags.some(tag => activeTags.has(tag));
    });
    
    if (filteredVideos.length === 0) {
        console.log('No videos match the selected tags');
        return;
    }

    const randomVideo = filteredVideos[Math.floor(Math.random() * filteredVideos.length)];

    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
        <div class="item-content">
            <video controls>
                <source src="${randomVideo.src}" type="${randomVideo.type}">
                Your browser does not support the video tag.
            </video>
        </div>
    `;
    item.videoData = randomVideo;

    grid.add(item);
}
