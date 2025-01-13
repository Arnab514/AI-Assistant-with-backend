import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Sparkles, Brain, Target, Lightbulb } from "lucide-react";
import FooterChip from "./FooterChip";
import { generateOptions, generateDetailedResponse } from "./api/chat";
import { RankedOptionCard } from './components/RankedOption';

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState({
    stage: 'initial',
    currentOptions: [],
    selectedOptions: []
  });
  const [rankedOptions, setRankedOptions] = useState([]);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    if (chatHistory.length > 0) {
      setShowWelcome(false);
    }
  }, [chatHistory, generatingAnswer]);

  const parseNumberSelection = (input) => {
    const numbers = input.toLowerCase().match(/\d+/g);
    if (!numbers || numbers.length !== 2) return null;
    
    const num1 = parseInt(numbers[0]);
    const num2 = parseInt(numbers[1]);
    
    if (num1 < 1 || num1 > 3 || num2 < 1 || num2 > 3 || num1 === num2) {
      return null;
    }
    
    return [num1, num2].sort((a, b) => a - b);
  };

  const handleUserInput = async (e) => {
    e.preventDefault();
    if (!question.trim() || generatingAnswer) return;

    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion("");

    setChatHistory(prev => [...prev, { 
      type: 'question', 
      content: currentQuestion,
      id: Date.now()
    }]);

    setIsTyping(true);
    
    try {
      if (conversationState.stage === 'initial') {
        const options = await generateOptions(currentQuestion);
        setChatHistory(prev => [...prev, { 
          type: 'answer', 
          content: `${options}\n\nPlease select 2 options by typing their numbers (e.g., '1 and 2')`,
          id: Date.now() + 1
        }]);
        setConversationState({
          stage: 'awaiting_selection',
          currentOptions: options.split('\n').filter(opt => opt.trim()),
          selectedOptions: []
        });
      } else if (conversationState.stage === 'awaiting_selection') {
        const selectedNumbers = parseNumberSelection(currentQuestion);
        
        if (selectedNumbers) {
          const selected = selectedNumbers.map(num => 
            conversationState.currentOptions[num - 1]
          ).filter(Boolean);

          const detailedResponse = await generateDetailedResponse(
            chatHistory[0].content,
            selected
          );
          
          setChatHistory(prev => [...prev, { 
            type: 'answer', 
            content: detailedResponse,
            id: Date.now() + 1
          }]);
          
          setConversationState({
            stage: 'initial',
            currentOptions: [],
            selectedOptions: []
          });
        } else {
          setChatHistory(prev => [...prev, { 
            type: 'answer', 
            content: "Please select exactly 2 different numbers between 1 and 3 (e.g., '1 and 2')",
            id: Date.now() + 1
          }]);
        }
      }
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { 
        type: 'answer', 
        content: "Sorry, something went wrong. Please try again.",
        id: Date.now() + 1
      }]);
    } finally {
      setGeneratingAnswer(false);
      setIsTyping(false);
    }
  }

  const extractOptionTitles = (options) => {
    return options.map(option => {
      const match = option.match(/\d+\.\s*([^:]+)/);
      return match ? match[1].trim() : option;
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 animate-gradient">
      <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
        <header className="text-center py-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl"></div>
          <div className="relative flex items-center justify-center gap-3">
            <Bot className="w-8 h-8 text-purple-400 animate-float" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Assistant
            </h1>
          </div>
        </header>

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 rounded-xl glass-morphism bg-gray-800/50 shadow-xl p-4 border border-gray-700"
        >
          {showWelcome && chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="glass-morphism bg-gray-800/80 rounded-xl p-8 max-w-2xl border border-gray-700 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    Welcome to Your AI Assistant!
                  </h2>
                </div>
                <p className="text-gray-300 mb-6">
                  I'm here to help! Ask me anything and I'll provide interactive options for you to explore.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {[
                    { icon: Brain, text: 'Brainstorm Ideas' },
                    { icon: Target, text: 'Solve Problems' },
                    { icon: Sparkles, text: 'Get Recommendations' },
                    { icon: Lightbulb, text: 'Explore Options' }
                  ].map(({ icon: Icon, text }, index) => (
                    <div 
                      key={index} 
                      className="glass-morphism bg-gray-700/50 p-4 rounded-lg border border-gray-600 transform hover:scale-105 transition-all duration-300 hover:bg-gray-700/70 flex items-center gap-2"
                    >
                      <Icon className="w-5 h-5 text-purple-400" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {chatHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`flex ${chat.type === 'question' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-4 rounded-xl ${
                      chat.type === 'question'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white chat-bubble-user'
                        : 'glass-morphism bg-gray-700/50 text-gray-100 border border-gray-600 chat-bubble-ai'
                    }`}
                  >
                    <ReactMarkdown className="prose prose-invert max-w-none">
                      {chat.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {generatingAnswer && (
                <div className="flex justify-start">
                  <div className="glass-morphism bg-gray-700/50 p-4 rounded-xl border border-gray-600 flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-gray-300">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleUserInput} className="glass-morphism bg-gray-800/50 rounded-xl shadow-xl p-4 border border-gray-700">
          <div className="flex gap-2">
            <textarea
              required
              className="flex-1 glass-morphism bg-gray-700/50 border border-gray-600 rounded-xl p-4 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none text-gray-100 placeholder-gray-400 transition-all duration-300"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                conversationState.stage === 'awaiting_selection'
                  ? "Type two numbers to select options (e.g., '1 and 2')"
                  : "Ask anything..."
              }
              rows="2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleUserInput(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={generatingAnswer}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-gray-100 shadow-lg transition-all duration-300 ${
                generatingAnswer
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
              }`}
            >
              {generatingAnswer ? (
                "Thinking..."
              ) : (
                <>
                  Send
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <FooterChip />
    </div>
  );
};

export default App;





// import { useState, useRef, useEffect } from "react";
// import ReactMarkdown from "react-markdown";
// import { Bot, Send, Sparkles, Brain, Target, Lightbulb } from "lucide-react";
// import FooterChip from "./FooterChip";
// import { generateOptions, generateDetailedResponse } from "./api/chat";
// import { RankedOptionCard } from './components/RankedOption';

// const App = () => {
//   const [chatHistory, setChatHistory] = useState([]);
//   const [question, setQuestion] = useState("");
//   const [generatingAnswer, setGeneratingAnswer] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [isTyping, setIsTyping] = useState(false);
//   const [conversationState, setConversationState] = useState({
//     stage: 'initial',
//     currentOptions: [],
//     selectedOptions: []
//   });
//   const [rankedOptions, setRankedOptions] = useState([]);

//   const chatContainerRef = useRef(null);

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//     if (chatHistory.length > 0) {
//       setShowWelcome(false);
//     }
//   }, [chatHistory, generatingAnswer]);

//   const parseNumberSelection = (input) => {
//     const numbers = input.toLowerCase().match(/\d+/g);
//     if (!numbers || numbers.length !== 2) return null;
    
//     const num1 = parseInt(numbers[0]);
//     const num2 = parseInt(numbers[1]);
    
//     if (num1 < 1 || num1 > 3 || num2 < 1 || num2 > 3 || num1 === num2) {
//       return null;
//     }
    
//     return [num1, num2].sort((a, b) => a - b);
//   };

//   // Update handleUserInput
//   const handleUserInput = async e => {
//     e.preventDefault()
//     if (!question.trim() || generatingAnswer) return

//     setGeneratingAnswer(true)
//     const currentQuestion = question
//     setQuestion("")

//     setChatHistory(prev => [
//       ...prev,
//       {
//         type: "question",
//         content: currentQuestion,
//         id: Date.now()
//       }
//     ])

//     setIsTyping(true)

//     try {
//       if (conversationState.stage === "initial") {
//         const options = await generateOptions(currentQuestion)
//         setRankedOptions(options)

//         const optionsDisplay = options
//           .map(
//             (opt, index) =>
//               `${index + 1}. ${
//                 opt.option
//               } (Priority Score: ${opt.scores.average.toFixed(1)})`
//           )
//           .join("\n")

//         setChatHistory(prev => [
//           ...prev,
//           {
//             type: "answer",
//             content: `Here are your options, ranked by priority:\n\n${optionsDisplay}\n\nSelect an option by clicking the "Select" button or type its number.`,
//             id: Date.now() + 1,
//             rankedOptions: options
//           }
//         ])

//         setConversationState({
//           stage: "awaiting_selection",
//           currentOptions: options.map(opt => opt.option),
//           selectedOptions: []
//         })
//       } else if (conversationState.stage === 'awaiting_selection') {
//         const selectedNumbers = parseNumberSelection(currentQuestion);
        
//         if (selectedNumbers) {
//           const selected = selectedNumbers.map(num => 
//             conversationState.currentOptions[num - 1]
//           ).filter(Boolean);

//           const detailedResponse = await generateDetailedResponse(
//             chatHistory[0].content,
//             selected
//           );
          
//           setChatHistory(prev => [...prev, { 
//             type: 'answer', 
//             content: detailedResponse,
//             id: Date.now() + 1
//           }]);
          
//           setConversationState({
//             stage: 'initial',
//             currentOptions: [],
//             selectedOptions: []
//           });
//         } else {
//           setChatHistory(prev => [...prev, { 
//             type: 'answer', 
//             content: "Please select exactly 2 different numbers between 1 and 3 (e.g., '1 and 2')",
//             id: Date.now() + 1
//           }]);
//         }
//       }
//     } catch (error) {
//       console.error(error)
//       setChatHistory(prev => [
//         ...prev,
//         {
//           type: "answer",
//           content: "Sorry, something went wrong. Please try again.",
//           id: Date.now() + 1
//         }
//       ])
//     } finally {
//       setGeneratingAnswer(false)
//       setIsTyping(false)
//     }
//   }

//   const extractOptionTitles = (options) => {
//     return options.map(option => {
//       const match = option.match(/\d+\.\s*([^:]+)/);
//       return match ? match[1].trim() : option;
//     });
//   };


//     // Update the chat message rendering in your JSX
//     const renderChatMessage = chat => {
//       if (chat.type === "question") {
//         return (
//           <div className="prose prose-invert max-w-none">
//             <ReactMarkdown>{chat.content}</ReactMarkdown>
//           </div>
//         )
//       }
  
//       if (chat.rankedOptions) {
//         return (
//           <div className="space-y-4">
//             <div className="prose prose-invert max-w-none mb-4">
//               <ReactMarkdown>{chat.content}</ReactMarkdown>
//             </div>
//             {chat.rankedOptions.map((option, index) => (
//               <RankedOptionCard
//                 key={index}
//                 option={option}
//                 index={index}
//                 onSelect={() => {
//                   // Handle selection
//                   const selected = [option.option]
//                   handleOptionSelection(selected)
//                 }}
//               />
//             ))}
//           </div>
//         )
//       }
  
//       return (
//         <div className="prose prose-invert max-w-none">
//           <ReactMarkdown>{chat.content}</ReactMarkdown>
//         </div>
//       )
//     }

//   return (
//         // ... (your existing JSX, but update the chat message rendering)
//         <div className="space-y-6">
//         {chatHistory.map(chat => (
//           <div
//             key={chat.id}
//             className={`flex ${
//               chat.type === "question" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`max-w-[80%] p-4 rounded-xl ${
//                 chat.type === "question"
//                   ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white chat-bubble-user"
//                   : "glass-morphism bg-gray-700/50 text-gray-100 border border-gray-600 chat-bubble-ai"
//               }`}
//             >
//               {renderChatMessage(chat)}
//             </div>
//           </div>
//         ))}
//         {/* ... rest of your JSX */}

//         <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 animate-gradient">
//       <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
//         <header className="text-center py-6 relative">
//           <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl"></div>
//           <div className="relative flex items-center justify-center gap-3">
//             <Bot className="w-8 h-8 text-purple-400 animate-float" />
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
//               AI Assistant
//             </h1>
//           </div>
//         </header>

//         <div 
//           ref={chatContainerRef}
//           className="flex-1 overflow-y-auto mb-4 rounded-xl glass-morphism bg-gray-800/50 shadow-xl p-4 border border-gray-700"
//         >
//           {showWelcome && chatHistory.length === 0 ? (
//             <div className="h-full flex flex-col items-center justify-center text-center p-6">
//               <div className="glass-morphism bg-gray-800/80 rounded-xl p-8 max-w-2xl border border-gray-700 shadow-2xl transform hover:scale-105 transition-all duration-300">
//                 <div className="flex items-center justify-center gap-2 mb-4">
//                   <Sparkles className="w-6 h-6 text-purple-400" />
//                   <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
//                     Welcome to Your AI Assistant!
//                   </h2>
//                 </div>
//                 <p className="text-gray-300 mb-6">
//                   I'm here to help! Ask me anything and I'll provide interactive options for you to explore.
//                 </p>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
//                   {[
//                     { icon: Brain, text: 'Brainstorm Ideas' },
//                     { icon: Target, text: 'Solve Problems' },
//                     { icon: Sparkles, text: 'Get Recommendations' },
//                     { icon: Lightbulb, text: 'Explore Options' }
//                   ].map(({ icon: Icon, text }, index) => (
//                     <div 
//                       key={index} 
//                       className="glass-morphism bg-gray-700/50 p-4 rounded-lg border border-gray-600 transform hover:scale-105 transition-all duration-300 hover:bg-gray-700/70 flex items-center gap-2"
//                     >
//                       <Icon className="w-5 h-5 text-purple-400" />
//                       <span>{text}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {chatHistory.map((chat) => (
//                 <div 
//                   key={chat.id} 
//                   className={`flex ${chat.type === 'question' ? 'justify-end' : 'justify-start'}`}
//                 >
//                   <div 
//                     className={`max-w-[80%] p-4 rounded-xl ${
//                       chat.type === 'question'
//                         ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white chat-bubble-user'
//                         : 'glass-morphism bg-gray-700/50 text-gray-100 border border-gray-600 chat-bubble-ai'
//                     }`}
//                   >
//                     <ReactMarkdown className="prose prose-invert max-w-none">
//                       {chat.content}
//                     </ReactMarkdown>
//                   </div>
//                 </div>
//               ))}
//               {generatingAnswer && (
//                 <div className="flex justify-start">
//                   <div className="glass-morphism bg-gray-700/50 p-4 rounded-xl border border-gray-600 flex items-center gap-3">
//                     <div className="flex space-x-1">
//                       <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                       <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                       <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                     </div>
//                     <span className="text-gray-300">Thinking...</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         <form onSubmit={handleUserInput} className="glass-morphism bg-gray-800/50 rounded-xl shadow-xl p-4 border border-gray-700">
//           <div className="flex gap-2">
//             <textarea
//               required
//               className="flex-1 glass-morphism bg-gray-700/50 border border-gray-600 rounded-xl p-4 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none text-gray-100 placeholder-gray-400 transition-all duration-300"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               placeholder={
//                 conversationState.stage === 'awaiting_selection'
//                   ? "Type two numbers to select options (e.g., '1 and 2')"
//                   : "Ask anything..."
//               }
//               rows="2"
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter' && !e.shiftKey) {
//                   e.preventDefault();
//                   handleUserInput(e);
//                 }
//               }}
//             />
//             <button
//               type="submit"
//               disabled={generatingAnswer}
//               className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-gray-100 shadow-lg transition-all duration-300 ${
//                 generatingAnswer
//                   ? "bg-gray-600 cursor-not-allowed"
//                   : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
//               }`}
//             >
//               {generatingAnswer ? (
//                 "Thinking..."
//               ) : (
//                 <>
//                   Send
//                   <Send className="w-4 h-4" />
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//       <FooterChip />
//     </div>
//       </div>
    
//   );
// };

// export default App;