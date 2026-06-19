<script setup lang="ts">
import { DialogRoot, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'radix-vue'
import { X } from 'lucide-vue-next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/utils/cn'

const modalVariants = cva(
  'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

type ModalVariants = VariantProps<typeof modalVariants>

const props = withDefaults(defineProps<{
  open?: boolean
  title?: string
  size?: ModalVariants['size']
}>(), { size: 'md' })

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <DialogRoot :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent :class="cn(modalVariants({ size: props.size }))">
        <div v-if="title || $slots.header" class="flex items-center justify-between">
          <DialogTitle class="text-lg font-semibold">
            <slot name="header">{{ title }}</slot>
          </DialogTitle>
          <DialogClose class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X class="h-4 w-4" />
          </DialogClose>
        </div>
        <DialogDescription v-if="$slots.description" class="text-sm text-muted-foreground">
          <slot name="description" />
        </DialogDescription>
        <div>
          <slot />
        </div>
        <div v-if="$slots.footer" class="flex justify-end gap-2 pt-2">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
