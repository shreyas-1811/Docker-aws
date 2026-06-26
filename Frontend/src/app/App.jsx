import "./App.css"
import {Editor} from "@monaco-editor/react"
import {MonacoBinding} from "y-monaco"
import {useRef,useMemo,useState,useEffect} from "react"
import * as Y from "yjs"
import {SocketIOProvider} from "y-socket.io"

function App() {

  const editorRef = useRef(null)
  const [username, setUsername] = useState( () => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })

  const [users,setUsers] = useState([])  //This will store the list of all the connected users

  const ydoc = useMemo(() => new Y.Doc(), [])   //All the cod will be stored in this ydoc object
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])  //This will create a yText object which will be used to bind the monaco editor with the ydoc object

  const handleMount = (editor) => {
    editorRef.current = editor
    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),    //This will bind the yText to the monaco editor and sync the changes with other clients
    )
    
  }



  const handleJoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)  //This will set the username to the value entered in the input field
    window.history.pushState({},"","?username = " +e.target.username.value)  //This will add the username to the url query params
    }

    useEffect(() => {
      console.log(username)
      if(username){
    const provider = new SocketIOProvider("/", "monaco-demo", ydoc,{  //This will create a provider object which will be used to connect to the backend server and sync the ydoc with other clients
      autoConnect: true,  //This will automatically connect to the backend server when the component is mounted
    })  //This will connect to the backend server and sync the ydoc with other clients
    provider.awareness.setLocalStateField("user",{username})

    
    const states = Array.from(provider.awareness.getStates().values())

    setUsers(states.filter(state => state.user && state.user.username).map(state => state.user)) //This will set the users state to the list of usernames of all the connected clients
    console.log(states)

    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().values())
      setUsers(states.filter(state => state.user && state.user.username).map(state => state.user)) //This will set the users state to the list of usernames of all the connected clients
    })



    function handlebeforeUnload(){
      provider.awareness.setLocalStateField("user",null) 
     } //This will remove the user from the list of connected clients when the user leaves the page

    window.addEventListener("beforeunload", handlebeforeUnload)  //This will add an event listener to the window object which will call the handlebeforeUnload function when the user leaves the page

    
    return () => {
      provider.destroy()  //This will destroy the provider when the component is unmounted
      window.removeEventListener("beforeunload", handlebeforeUnload)  //This will remove the event listener when the component is unmounted
      } 
    }
    },[
      username

    ])


  if(!username){
    return(
      <main className = "h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
        <form onSubmit = {handleJoin}
        className = "flex flex-col gap-4 items-center justify-center">
          <input type = "text" name = "username" placeholder = "Enter your username" className = "p-2 rounded-lg bg-gray-800 text-white" />
          <button className = "p-2 rounded-lg bg-blue-500 text-white" > Join

          </button>
        </form>
      </main>
    )
  }


  

  return (
    <main className = "h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className = "h-full w-1/4 bg-amber-50 rounded-lg"
      >
      <h2 className = "text-2xl font-bold text-center p-4 bg-gray-800 text-white">Connected Users</h2>
      <ul className = "p-4">
        {users.map((user,index) => (
          <li key = {index} className = "p-2 bg-gray-800 text-white rounded-lg mb-2">{user.username}</li>
        ))}
        </ul>
      

      </aside>
      <section
        className = "w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
          <Editor
            height = "100%"
            width = "100%"
            defaultLanguage = "javascript"
            defaultValue = "// some comment"
            theme = "vs-dark"
            onMount = {handleMount}
          />
      </section>
    </main>
  )
}

export default App
