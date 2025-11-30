/**
 * Exemplos de Componentes - Design System Ricardo Esper Blog
 * 
 * Este arquivo contém exemplos de uso dos componentes seguindo o design system.
 * Use como referência para implementação.
 */

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Lock, Home, Plane, ArrowRight, Info } from "lucide-react";

// ============================================================================
// BUTTON EXAMPLES
// ============================================================================

export function ButtonExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold mb-4">Botões</h3>

      {/* Primary Button */}
      <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
        Ação Principal
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>

      {/* Outline Button */}
      <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
        Ação Secundária
      </Button>

      {/* Ghost Button */}
      <Button variant="ghost" className="hover:bg-muted">
        Ação Terciária
      </Button>

      {/* Link Button */}
      <Button variant="link" className="text-primary underline-offset-4">
        Link de Texto
      </Button>
    </div>
  );
}

// ============================================================================
// CARD EXAMPLES
// ============================================================================

export function CardExamples() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold mb-4">Cards</h3>

      {/* Post Card */}
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <Badge
            variant="outline"
            className="border-[#0088C7]/30 text-[#0088C7] bg-[#0088C7]/5 mb-2"
          >
            Cibersegurança
          </Badge>
          <CardTitle className="group-hover:text-primary transition-colors">
            Título do Post
          </CardTitle>
          <CardDescription>
            Data: 27 de janeiro de 2025 • 5 min de leitura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Descrição ou resumo do post sobre cibersegurança e proteção de dados...
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <time className="text-sm text-muted-foreground">27 jan 2025</time>
          <Button variant="ghost" size="sm">
            Ler mais <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Author Card */}
      <Card className="bg-muted/30">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src="/ricardo-esper.jpg" alt="Ricardo Esper" />
              <AvatarFallback>RE</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Ricardo Esper</CardTitle>
              <CardDescription>CISO | Especialista em Cibersegurança</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Mais de 30 anos de experiência em cibersegurança, contraespionagem e proteção de dados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// BADGE EXAMPLES
// ============================================================================

export function BadgeExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold mb-4">Badges por Categoria</h3>

      <div className="flex flex-wrap gap-2">
        {/* Cibersegurança */}
        <Badge
          variant="outline"
          className="border-[#0088C7]/30 text-[#0088C7] bg-[#0088C7]/5"
        >
          <Shield className="w-3 h-3 mr-1" />
          Cibersegurança
        </Badge>

        {/* Contraespionagem */}
        <Badge
          variant="outline"
          className="border-[#006B9E]/30 text-[#006B9E] bg-[#006B9E]/5"
        >
          <Lock className="w-3 h-3 mr-1" />
          Contraespionagem
        </Badge>

        {/* Automação Residencial */}
        <Badge
          variant="outline"
          className="border-[#33B8E8]/30 text-[#33B8E8] bg-[#33B8E8]/5"
        >
          <Home className="w-3 h-3 mr-1" />
          Automação Residencial
        </Badge>

        {/* Viagens */}
        <Badge
          variant="outline"
          className="border-[#00B5D4]/30 text-[#00B5D4] bg-[#00B5D4]/5"
        >
          <Plane className="w-3 h-3 mr-1" />
          Viagens
        </Badge>
      </div>
    </div>
  );
}

// ============================================================================
// ALERT EXAMPLES
// ============================================================================

export function AlertExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold mb-4">Alertas</h3>

      {/* Security Alert */}
      <Alert className="border-primary/50 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertTitle>Atenção - Segurança</AlertTitle>
        <AlertDescription>
          Este procedimento requer conhecimento técnico avançado.
          Execute apenas se tiver experiência adequada.
        </AlertDescription>
      </Alert>

      {/* Info Alert */}
      <Alert variant="default" className="bg-muted">
        <Info className="h-4 w-4" />
        <AlertTitle>Nota Importante</AlertTitle>
        <AlertDescription>
          Informação complementar relevante sobre o tópico.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ============================================================================
// ICON EXAMPLES
// ============================================================================

export function IconExamples() {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold mb-4">Ícones Monocromáticos</h3>

      <div className="flex items-center gap-6">
        {/* Outline padrão */}
        <Shield className="w-5 h-5 text-muted-foreground" />

        {/* Estado ativo com preenchimento sutil */}
        <div className="bg-primary/10 rounded-full p-1.5">
          <Lock className="w-5 h-5 text-primary" />
        </div>

        {/* Badge pequeno */}
        <div className="bg-primary/10 rounded-full p-2">
          <Home className="w-4 h-4 text-primary" />
        </div>

        {/* Tamanhos diferentes */}
        <Plane className="w-4 h-4 text-muted-foreground" />
        <Plane className="w-5 h-5 text-muted-foreground" />
        <Plane className="w-6 h-6 text-muted-foreground" />
      </div>
    </div>
  );
}

// ============================================================================
// TYPOGRAPHY EXAMPLES
// ============================================================================

export function TypographyExamples() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold mb-4">Tipografia</h3>

      {/* H1 */}
      <h1>Título Principal (H1)</h1>

      {/* H2 */}
      <h2>Seção e Intertítulo (H2)</h2>

      {/* H3 */}
      <h3>Subseção (H3)</h3>

      {/* Corpo */}
      <p>
        Este é um parágrafo de exemplo usando Montserrat como fonte principal.
        O texto está configurado com tamanho de 18px (1.125rem) e line-height
        de 1.75 para uma leitura confortável em posts longos.
      </p>

      {/* Citação */}
      <blockquote>
        &ldquo;Esta é uma citação técnica destacada. Use para alertas importantes,
        recomendações de segurança ou insights relevantes.&rdquo;
      </blockquote>

      {/* Metadados */}
      <time className="metadata">27 de janeiro de 2025</time>
    </div>
  );
}

// ============================================================================
// ALL EXAMPLES
// ============================================================================

export default function ComponentExamples() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <h1 className="text-5xl font-bold mb-8">Design System - Exemplos</h1>

      <ButtonExamples />
      <CardExamples />
      <BadgeExamples />
      <AlertExamples />
      <IconExamples />
      <TypographyExamples />
    </div>
  );
}

