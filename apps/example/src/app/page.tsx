"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useE2EE } from "@trelent/e2ee-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  message: z.string().min(1, {
    message: "Message is required",
  }),
});

interface Message {
  text: string;
  sender: "jane" | "john";
  timestamp: string;
}

const MessageBubble = ({
  encryptedMessage,
  sender,
}: {
  encryptedMessage: string;
  sender: "jane" | "john";
}) => {
  const { decrypt } = useE2EE();
  const [decryptedMessage, setDecryptedMessage] = useState<Message>();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    async function decryptMessage() {
      try {
        const decrypted = await decrypt<Message>(encryptedMessage);
        setDecryptedMessage(decrypted);
      } catch (err) {
        console.error("Failed to decrypt message:", err);
      }
    }

    decryptMessage();
  }, [decrypt, encryptedMessage]);

  return (
    <div
      className={`flex ${
        sender === "jane" ? "justify-start" : "justify-end"
      } mb-4`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          decryptedMessage?.sender === "jane"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        <div className="text-sm mb-1">
          {decryptedMessage?.sender === "jane" ? "Jane Doe" : "John Doe"}
        </div>
        <div className="break-words">
          {decryptedMessage && isHovering
            ? decryptedMessage.text
            : encryptedMessage}
        </div>
        <div className="text-xs mt-1 opacity-75">
          {decryptedMessage?.timestamp}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { encrypt, getPassphrase } = useE2EE();
  const [messages, setMessages] = useState<
    Array<{
      encrypted: string;
      sender: "jane" | "john";
      timestamp: string;
    }>
  >([]);
  const [currentSender, setCurrentSender] = useState<"jane" | "john">("jane");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const encrypted = await encrypt(values.message);
    const timestamp = new Date().toLocaleTimeString();

    setMessages((prev) => [
      ...prev,
      {
        encrypted,
        sender: currentSender,
        timestamp,
      },
    ]);

    setCurrentSender((current) => (current === "jane" ? "john" : "jane"));
    form.reset();
  }

  useEffect(() => {
    const passphrase = getPassphrase();
    console.log("passphrase", passphrase);
  }, [getPassphrase]);

  return (
    <main className="container flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Chat between Jane & John</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-h-[400px] overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                encryptedMessage={msg.encrypted}
                sender={msg.sender}
              />
            ))}
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={`Type your message as ${
                          currentSender === "jane" ? "Jane" : "John"
                        }...`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
