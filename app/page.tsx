"use client"
import WithAuth from "./WithAuth";
import { FunctionComponent, useState, useEffect } from 'react';
import axios from "axios";

const ProtectedPage: FunctionComponent = () => {
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [chatList, setChatList] = useState([{title: '', id: 0}]);
  const [selectedChat, setSelectedChat] = useState<{ title: string; id: number } | null>(null);

  interface Chat {
    title: string;
    id: number;
  }

  const sendMessage = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/sendMessage', {
        message,
        selectedChat
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data.success) {
        setErr('Сообщение отправлено!');
        setMessage('');
      } else {
        setErr('Ошибка при отправке сообщения.');
      }
    } catch (error) {
      console.error(error);
      setErr('Ошибка при отправке сообщения.');
    }
  };

  useEffect(() => {
    axios.get(`https://api.telegram.org/bot${process.env.API_TOKEN}/getUpdates`)
      .then(function (response) {
        const results = response.data.result;

        results.forEach((element: any) => {
          if (element.message) {
            let user = element.message.chat
            let data: Chat = { title: "", id: 0 };

            if (user.title) {
              data = { title: user.title, id: user.id };
            } else if (user.username) {
              data = { title: user.username, id: user.id };
            }

            if(data.title !== "" && !chatList.some(obj => obj.id === data.id)){
              setChatList([...chatList, data])
            }
          }
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [chatList]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  return (
    <div>
      <WithAuth />
      <div className="flex flex-col w-3/5 m-auto gap-3">
        <h1>Выберите чат</h1>
        <ul>
          {chatList.map((chat, index) => (
            <li key={index} onClick={() => handleChatSelect(chat)} className="cursor-pointer">
              {chat.title}
            </li>
          ))}
        </ul>
        {selectedChat && (
          <div className="border-2 border-green-500 p-2">
            <h2>Выбранный чат</h2>
            <p>Название: {selectedChat.title}</p>
            <p>ID: {selectedChat.id}</p>
          </div>
        )}
        {err && <div className="border-2 border-red-500">{err}</div>}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="bg-red-600 text-white hover:text-blue-500"
          onClick={sendMessage}
        >
          submit
        </button>
      </div>
    </div>
  );
};

export default ProtectedPage;