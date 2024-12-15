const noteText = document.getElementById('noteText');
const noteList = document.getElementById('noteList');
const searchText = document.getElementById('searchText');

const endpoint = "http://localhost:3000";


function fetchNotes() {
  fetch(`${endpoint}/api/notes`)
    .then(response => response.json())
    .then(data => {
      displayNotes(data);
    })
    .catch(error => console.error('Error fetching notes:', error));
}


function displayNotes(notes) {
  noteList.innerHTML = '';
  const notesGrid = document.createElement('div');
  notesGrid.classList.add('notes-grid');

  notes.forEach(note => {
    const createdAtFormatted = new Date(note.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });

    const noteContainer = document.createElement('div');
    noteContainer.classList.add('note-container');

    const noteContent = document.createElement('div');
    noteContent.classList.add('note-content');

    noteContent.innerHTML = `
      <div class="note" data-id="${note._id}"> <!-- Add data-id attribute with note._id value -->
        <h2 contenteditable="true" class="editable-title">${note.title}</h2>
        <div contenteditable="true" class="editable-content">${note.content}</div>
        <div class="note-date">${createdAtFormatted}</div>
        <div class="actions">
          <button class="update"><img src='edit.png' class="icon"></button>
          <button class="delete"><img src='bin.png' class ="icon"></button>
        </div>
      </div>
    `;


    const deleteButton = noteContent.querySelector('.delete');
    const updateButton = noteContent.querySelector('.update');

    deleteButton.addEventListener('click', () => deleteNote(note._id));
    updateButton.addEventListener('click', () => updateNote(note._id));

    noteContainer.appendChild(noteContent);
    notesGrid.appendChild(noteContainer);
  });

  noteList.appendChild(notesGrid);
}



function searchNotes() {
  const searchTextValue = searchText.value.trim();

  if (searchTextValue === '') {
    fetchNotes(); 
    return;
  }

  fetch(`${endpoint}/api/notes/search?q=${searchTextValue}`)
    .then(response => response.json())
    .then(data => {
      displayNotes(data);
    })
    .catch(error => console.error('Error searching notes:', error));
}

function createNote() {
  const noteTitle = document.getElementById('noteTitle').value.trim();
  const noteContent = document.getElementById('noteText').value.trim().replace(/\n/g, '<br>');


  if (noteTitle === '' || noteContent === '') {
    alert('Please enter a title and content for the note.');
    return;
  }

  const createdAt = new Date(); 

  const note = {
    title: noteTitle,
    content: noteContent,
    createdAt: createdAt 
  };

  fetch(`${endpoint}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    } else {
      noteText.value = '';
      document.getElementById('noteTitle').value = '';
      fetchNotes();
    }
  })
  .catch(error => console.error('Error creating note:', error));
}


function deleteNote(id) {
  fetch(`${endpoint}/api/notes/${id}`, {
    method: 'DELETE',
  })
  .then(() => {
    fetchNotes();
  })
  .catch(error => console.error('Error deleting note:', error));
}

function updateNote(id) {
  const noteElement = document.querySelector(`div[data-id="${id}"]`);
  const title = noteElement.querySelector('.editable-title').innerText;
  let content = noteElement.querySelector('.editable-content').innerHTML;
  

  content = content.replace(/\n/g, '<br>');

  const updatedNote = {
    title: title,
    content: content
  };

  fetch(`${endpoint}/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedNote),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    } else {
      fetchNotes(); 
    }
  })
  .catch(error => console.error('Error updating note:', error));
}




function replaceBrWithNewline(content) {
  return content.replace(/<br\s*\/?>/mg, '\n');
}

searchText.addEventListener('input', searchNotes);

fetchNotes();
