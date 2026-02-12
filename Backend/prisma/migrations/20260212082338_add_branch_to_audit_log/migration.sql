/*
  Warnings:

  - A unique constraint covering the columns `[module,stage]` on the table `SLAPolicy` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX `SLAPolicy_module_idx` ON `SLAPolicy`(`module`);

-- CreateIndex
CREATE UNIQUE INDEX `SLAPolicy_module_stage_key` ON `SLAPolicy`(`module`, `stage`);
