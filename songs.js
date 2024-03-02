import axios from "axios";

async function search(query) {

    const options = {
        method: 'GET',
        url: 'https://deezerdevs-deezer.p.rapidapi.com/search',
        params: { q: `${query}` },
        headers: {
            'X-RapidAPI-Key': '0301c009d6mshd89b0dab247b076p102d47jsnd3009bccd0b1',
            'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        return response.data
    } catch (error) {
        console.error(error);
    }
}

export default search;