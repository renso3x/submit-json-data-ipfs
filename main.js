
async function submitForm() {
    const JWT = document.getElementById('jwt-input').value.trim();

    const GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/';
    const metaData = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        middleName: document.getElementById('middle-name').value,
        position: document.getElementById('position').value, 
        userPhoto: {
            name: document.getElementById('user-photo').files[0].name,
            type: document.getElementById('user-photo').files[0].type,
        },
        resume: {
            name: document.getElementById('resume').files[0].name,
            type: document.getElementById('resume').files[0].type,
        } 
    }
    const statusWrapper = document.getElementById('status-wrapper');
    const statusText = document.getElementById('submitting-status');
    const statusDot = statusWrapper.querySelector('.status-dot');
    const cidOutput = document.getElementById('cid-output');

    statusWrapper.classList.remove('success', 'error');
    statusDot.style.backgroundColor = '';
    statusText.textContent = 'Uploading files to IPFS…';
    cidOutput.textContent = '';
    

    const uploadUserPhoto = await uploadFileIPFS(document.getElementById('user-photo').files[0]);
    metaData.userPhoto.url = `${GATEWAY_URL}${uploadUserPhoto.IpfsHash}`;

    const uploadResume = await uploadFileIPFS(document.getElementById('resume').files[0]);
    metaData.resume.url = `${GATEWAY_URL}${uploadResume.IpfsHash}`;

    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${JWT}`
            },
            // Pinata expects the JSON data inside `pinataContent`
            body: JSON.stringify({
                pinataContent: metaData
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pinata JSON pin error:', response.status, response.statusText, errorText);
            throw new Error('Failed to submit form data to IPFS');
        }

        const data = await response.json();
        console.log('Form data submitted successfully:', data);
        statusWrapper.classList.add('success');
        statusText.textContent = 'Form submitted successfully!';
        if (data && data.IpfsHash) {
            cidOutput.innerHTML = `<strong>Metadata CID:</strong> ${data.IpfsHash}`;
        }
    } catch (error) {
        console.error('Error submitting form data:', error);
        statusWrapper.classList.add('error');
        statusText.textContent = 'Error submitting form; check console.';
    }
}


async function uploadFileIPFS(file) {
    const JWT = document.getElementById('jwt-input').value.trim();

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${JWT}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload file to IPFS');
        }

        const data = await response.json();
        console.log('File uploaded successfully:', data);
        return data;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

document.getElementById('resumeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    submitForm();
});