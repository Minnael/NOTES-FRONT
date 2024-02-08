import * as Diolog from '@radix-ui/react-dialog'
import {X} from 'lucide-react'
import {ChangeEvent, FormEvent, useState} from 'react'
import {toast} from 'sonner'

interface NewNoteCardProps {
   onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

function NewNoteCard({onNoteCreated}: NewNoteCardProps){
   const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
   const [isRecording, setIsRecording] = useState(false)
   const [content, setContent] = useState('')


   function handleStartEditor(){
      setShouldShowOnboarding(false)
   }

   function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>){
      setContent(event.target.value)

      if (event.target.value === ''){
         setShouldShowOnboarding(true)
      }
   }

   function handleSaveNote(event: FormEvent){
      event.preventDefault()

      if (content == '') {
         return
      }

      onNoteCreated(content)
      setContent('')
      setShouldShowOnboarding(true)

      toast.success('Nota criada com sucesso!')
   }

   function handleStartRecording(){
      const isSpeechRecognitionAPIAvaible = 'SpeechRecognition' in window
         || 'webkitSpeechRecognition' in window

      if (!isSpeechRecognitionAPIAvaible){
         alert('Infelizmente seu navegador não suporta a API de gravação!')
         return
      }

      setIsRecording(true)
      setShouldShowOnboarding(false)

      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      
      speechRecognition = new SpeechRecognitionAPI()

      speechRecognition.lang = 'pt-BR'
      speechRecognition.continuous = true
      speechRecognition.maxAlternatives = 1
      speechRecognition.interimResults = true

      speechRecognition.onresult = (event) => {
         const transcription = Array.from(event.results).reduce((text, result) => {
            return text.concat(result[0].transcript)
         }, '') 

         setContent(transcription)
      }
      speechRecognition.onerror = (event) => {
         console.error(event)
      }
      speechRecognition.start()
   }


   function handleStopRecording(){
      setIsRecording(false)
      
      if (speechRecognition !== null) {
         speechRecognition.stop()
      }
   }

   return (
      <Diolog.Root>
         <Diolog.Trigger className="flex flex-col rounded-md bg-slate-700 text-left p-5 gap-3 hover:ring-2 hover:ring-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-lime-400">
            <span className="text-sm font-medium text-slate-200">
               Adicionar nota
            </span>
            <p className="text-sm leading-6 text-slate-400">
               Grave uma nota em áudio que será convertida para texto automaticamente.
            </p>
         </Diolog.Trigger>

         <Diolog.Portal>
            <Diolog.Overlay className="inset-0 fixed bg-black/60"/>
            <Diolog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 outline-none md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col">
               <Diolog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
                  <X className="size-5"/>
               </Diolog.Close>
               
               <form className="flex-1 flex flex-col">
                  <div className="flex flex-1 flex-col gap-3 p-5">
                     <span className="text-sm font-medium text-slate-300">
                        Adicionar nota
                     </span>

                     {shouldShowOnboarding ? (
                        <p className="text-sm leading-6 text-slate-400">
                           Comece <button type="button" onClick={handleStartRecording} className="font-medium text-lime-400 hover:underline">gravando uma nota</button> em áudio ou se preferir <button type="button" onClick={handleStartEditor} className="font-medium text-lime-400 hover:underline">utilize apenas texto</button>.
                        </p>
                     ) : (
                        <textarea
                           autoFocus 
                           className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                           onChange={handleContentChanged}
                           value={content}
                        />
                     )}
                  </div>
                        
                  {isRecording ?(
                     <button onClick={handleStopRecording} type="button" className="flex items-center justify-center gap-2 w-full bg-slate-900 py-4 text-center text-slate-300 text-sm outline-none font-medium hover:text-slate-100">
                        <div className="size-3 rounded-full bg-red-500 animate-pulse"/>
                        Gravando! (clique p/ interromper)
                     </button>
                  ) : (
                     <button onClick={handleSaveNote} type="button" className="w-full bg-lime-400 py-4 text-center text-lime-950 text-sm outline-none font-medium hover:bg-lime-500">
                        Salvar nota
                     </button>
                  )}

               </form>
            </Diolog.Content>
         </Diolog.Portal>
      </Diolog.Root>
   )
}

export default NewNoteCard